// Cloudflare Worker: serves the built site (static assets), the Vera chat
// endpoint, and the membership system (auth + per-user data on D1).
//
// Bindings / secrets:
//   ASSETS             — static assets (dist/), configured in wrangler.jsonc
//   DB                 — D1 database (wrangler.jsonc d1_databases)
//   ANTHROPIC_API_KEY  — secret; absent -> /api/chat returns 503 (keyword-bot fallback)
//   ANTHROPIC_MODEL    — optional var

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

// ── D1 schema (created lazily, once per isolate) ────────────────────────────
let schemaReady = null
function ensureSchema(db) {
  if (!schemaReady) {
    schemaReady = migrate(db).catch((e) => { schemaReady = null; throw e })
  }
  return schemaReady
}
async function migrate(db) {
  await baseTables(db)
  // line_id column for LINE Login (added after the first production schema).
  try { await db.prepare('ALTER TABLE users ADD COLUMN line_id TEXT').run() } catch { /* already exists */ }
  await db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_line ON users(line_id)').run()
  // Denormalized package amount on orders, so history survives price edits.
  try { await db.prepare('ALTER TABLE orders ADD COLUMN amount TEXT').run() } catch { /* already exists */ }
  // Member suspension flag.
  try { await db.prepare('ALTER TABLE users ADD COLUMN banned INTEGER NOT NULL DEFAULT 0').run() } catch { /* already exists */ }
  // Admin-managed coupons and site settings (key/value JSON).
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'pct',
      value INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      min_price INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      used_count INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)'),
  ])
  // Admin-managed content: per-game packages and news articles.
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gid TEXT NOT NULL,
      amount TEXT NOT NULL,
      price INTEGER NOT NULL,
      bonus INTEGER NOT NULL DEFAULT 0,
      tag TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_packages_gid ON packages(gid)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cat TEXT NOT NULL DEFAULT 'อัปเดต',
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
  ])
}

// Admins are the accounts whose email is listed in the ADMIN_EMAILS
// var/secret (comma-separated). LINE accounts can be listed as line:<userId>.
const adminEmails = (env) => ((env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))
const isAdminUser = (env, user) => !!user && adminEmails(env).includes(user.email.toLowerCase())
function baseTables(db) {
  return db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        pass_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 100,
        redeem_credit INTEGER NOT NULL DEFAULT 0,
        checked_days INTEGER NOT NULL DEFAULT 0,
        last_checkin TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        game_id TEXT NOT NULL,
        PRIMARY KEY (user_id, game_id)
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gid TEXT NOT NULL,
        pkg TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'success',
        ref TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`),
  ])
}

// ── auth helpers ────────────────────────────────────────────────────────────
const SESSION_COOKIE = 'gvg_session'
const SESSION_DAYS = 30
const PBKDF2_ITER = 50000

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: PBKDF2_ITER },
    key, 256,
  )
  return hex(bits)
}

const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)))

function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

const sessionCookie = (token, maxAge) =>
  `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`

async function currentUser(db, request) {
  const token = getCookie(request, SESSION_COOKIE)
  if (!token) return null
  const row = await db.prepare(
    'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?',
  ).bind(token, Date.now()).first()
  return row || null
}

// Bangkok-local calendar date, for the daily check-in.
const bkkToday = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

async function mePayload(db, user, env) {
  const favs = await db.prepare('SELECT game_id FROM favorites WHERE user_id = ?').bind(user.id).all()
  const orders = await db.prepare(
    'SELECT gid, pkg, status, ref, price, amount, created_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 30',
  ).bind(user.id).all()
  return {
    user: { email: user.email, name: user.name || '' },
    isAdmin: isAdminUser(env, user),
    points: user.points,
    redeemCredit: user.redeem_credit,
    checkedDays: user.checked_days,
    claimedToday: user.last_checkin === bkkToday(),
    favorites: (favs.results || []).map((r) => r.game_id),
    orders: (orders.results || []).map((o) => ({
      gid: o.gid, pkg: o.pkg, status: o.status, ref: o.ref, price: o.price, amount: o.amount || '', createdAt: o.created_at,
    })),
  }
}

async function readBody(request) {
  try { return await request.json() } catch { return null }
}

// ── LINE Login (OAuth 2.0 authorization-code flow) ──────────────────────────
// Requires LINE_CHANNEL_ID (var) + LINE_CHANNEL_SECRET (secret) from a
// LINE Login channel; its Callback URL must be <origin>/api/auth/line/callback.
const LINE_STATE_COOKIE = 'gvg_line_state'
const stateCookie = (value, maxAge) =>
  `${LINE_STATE_COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`

const redirectWith = (location, cookies) => {
  const headers = new Headers({ Location: location })
  for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(null, { status: 302, headers })
}

async function handleLine(request, env, path, url) {
  const failTo = (msg, extra = []) =>
    redirectWith(url.origin + '/?auth_error=' + encodeURIComponent(msg), [stateCookie('', 0), ...extra])

  if (path === '/api/auth/line/start') {
    if (!env.LINE_CHANNEL_ID || !env.LINE_CHANNEL_SECRET || !env.DB) {
      return failTo('ยังไม่ได้ตั้งค่า LINE Login (ต้องใส่ Channel ID/Secret ก่อน)')
    }
    const state = randomToken().slice(0, 32)
    const auth = new URL('https://access.line.me/oauth2/v2.1/authorize')
    auth.searchParams.set('response_type', 'code')
    auth.searchParams.set('client_id', env.LINE_CHANNEL_ID)
    auth.searchParams.set('redirect_uri', url.origin + '/api/auth/line/callback')
    auth.searchParams.set('state', state)
    auth.searchParams.set('scope', 'profile openid')
    return redirectWith(auth.toString(), [stateCookie(state, 600)])
  }

  if (path === '/api/auth/line/callback') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (url.searchParams.get('error')) return failTo('ยกเลิกการเข้าสู่ระบบด้วย LINE')
    if (!code || !state || state !== getCookie(request, LINE_STATE_COOKIE)) {
      return failTo('การยืนยันตัวตนไม่ถูกต้อง ลองใหม่อีกครั้ง')
    }
    try {
      const tokenResp = await fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: url.origin + '/api/auth/line/callback',
          client_id: env.LINE_CHANNEL_ID,
          client_secret: env.LINE_CHANNEL_SECRET,
        }),
      })
      if (!tokenResp.ok) {
        console.error('[line] token exchange', tokenResp.status, await tokenResp.text())
        return failTo('เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่อีกครั้ง')
      }
      const tok = await tokenResp.json()
      const profResp = await fetch('https://api.line.me/v2/profile', {
        headers: { Authorization: 'Bearer ' + tok.access_token },
      })
      if (!profResp.ok) return failTo('ดึงข้อมูลโปรไฟล์ LINE ไม่สำเร็จ')
      const prof = await profResp.json() // { userId, displayName, pictureUrl }

      const db = env.DB
      await ensureSchema(db)
      let user = await db.prepare('SELECT * FROM users WHERE line_id = ?').bind(prof.userId).first()
      if (!user) {
        user = await db.prepare(
          'INSERT INTO users (email, name, pass_hash, salt, line_id) VALUES (?, ?, ?, ?, ?) RETURNING *',
        ).bind('line:' + prof.userId, (prof.displayName || 'LINE User').slice(0, 60), '', '', prof.userId).first()
      } else if (user.banned) {
        return failTo('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อทีมงาน')
      } else if (prof.displayName && prof.displayName !== user.name) {
        await db.prepare('UPDATE users SET name = ? WHERE id = ?').bind(prof.displayName.slice(0, 60), user.id).run()
      }
      const token = randomToken()
      await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
        .bind(token, user.id, Date.now() + SESSION_DAYS * 86400000).run()
      return redirectWith(url.origin + '/?welcome=line', [
        stateCookie('', 0),
        sessionCookie(token, SESSION_DAYS * 86400),
      ])
    } catch (err) {
      console.error('[line] callback failed:', err && err.message)
      return failTo('เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
  }

  return json({ message: 'not found' }, 404)
}

// Built-in demo coupons — active only while no admin-created coupons exist.
const DEFAULT_COUPONS = {
  WELCOME10: { type: 'pct', value: 10, label: 'ส่วนลด 10% สำหรับสมาชิกใหม่' },
  GVG50: { type: 'fixed', value: 50, label: 'ส่วนลด ฿50' },
  FLASH20: { type: 'pct', value: 20, label: 'Flash Sale ลด 20%' },
}
const couponLabel = (type, value, label) => label || (type === 'pct' ? `ส่วนลด ${value}%` : `ส่วนลด ฿${value}`)

async function getSetting(db, key) {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first()
  if (!row) return null
  try { return JSON.parse(row.value) } catch { return null }
}

// ── public content (packages + articles, admin-managed) ─────────────────────
async function handleContent(env, path) {
  if (!env.DB) return json({ packages: {}, articles: [] })
  const db = env.DB
  await ensureSchema(db)
  if (path === '/api/site') {
    const ticker = await getSetting(db, 'ticker')
    const nCoupons = await db.prepare('SELECT COUNT(*) AS n FROM coupons').first()
    return json({ ticker: Array.isArray(ticker) && ticker.length ? ticker : null, customCoupons: nCoupons.n > 0 })
  }
  if (path === '/api/packages') {
    const rows = await db.prepare('SELECT id, gid, amount, price, bonus, tag FROM packages ORDER BY gid, sort, id').all()
    const packages = {}
    for (const r of rows.results || []) {
      if (!packages[r.gid]) packages[r.gid] = []
      packages[r.gid].push({ id: 'c' + r.id, amount: r.amount, price: r.price, bonus: r.bonus, tag: r.tag })
    }
    return json({ packages })
  }
  if (path === '/api/articles') {
    const rows = await db.prepare(
      'SELECT id, cat, title, excerpt, body, created_at FROM articles WHERE published = 1 ORDER BY id DESC LIMIT 60',
    ).all()
    return json({
      articles: (rows.results || []).map((a) => ({
        id: 'a' + a.id, cat: a.cat, title: a.title, excerpt: a.excerpt,
        body: a.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        createdAt: a.created_at,
      })),
    })
  }
  return json({ message: 'not found' }, 404)
}

// ── admin backoffice API ────────────────────────────────────────────────────
async function handleAdmin(request, env, path, url) {
  if (!env.DB) return json({ message: 'ยังไม่ได้ตั้งค่าฐานข้อมูล' }, 503)
  const db = env.DB
  await ensureSchema(db)
  const user = await currentUser(db, request)
  if (!user) return json({ message: 'กรุณาเข้าสู่ระบบ' }, 401)
  if (!isAdminUser(env, user)) return json({ message: 'บัญชีนี้ไม่มีสิทธิ์แอดมิน' }, 403)

  if (path === '/api/admin/overview' && request.method === 'GET') {
    const users = await db.prepare('SELECT COUNT(*) AS n FROM users').first()
    const orders = await db.prepare(`SELECT
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS ok,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        COALESCE(SUM(CASE WHEN status = 'success' THEN price ELSE 0 END), 0) AS sum
      FROM orders`).first()
    const latest = await db.prepare(
      `SELECT o.gid, o.pkg, o.amount, o.price, o.ref, o.status, o.created_at, u.email, u.name
       FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 15`,
    ).all()
    return json({
      users: users.n, orders: orders.ok || 0, pending: orders.pending || 0, revenue: orders.sum,
      latest: (latest.results || []).map((o) => ({
        gid: o.gid, pkg: o.pkg, amount: o.amount || '', price: o.price, ref: o.ref, status: o.status,
        createdAt: o.created_at, buyer: o.name || o.email,
      })),
    })
  }

  // ---- orders queue ----
  if (path === '/api/admin/orders' && request.method === 'GET') {
    const status = (url.searchParams.get('status') || 'all').slice(0, 10)
    const qRaw = (url.searchParams.get('q') || '').trim().slice(0, 60)
    const like = '%' + qRaw.replace(/[%_]/g, '') + '%'
    const rows = await db.prepare(
      `SELECT o.id, o.gid, o.pkg, o.amount, o.price, o.status, o.ref, o.created_at, u.email, u.name
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE (? = 'all' OR o.status = ?)
         AND (? = '' OR o.ref LIKE ? OR u.email LIKE ? OR u.name LIKE ?)
       ORDER BY o.id DESC LIMIT 150`,
    ).bind(status, status, qRaw, like, like, like).all()
    return json({ orders: rows.results || [] })
  }
  const ordMatch = path.match(/^\/api\/admin\/orders\/(\d{1,10})$/)
  if (ordMatch && request.method === 'POST') {
    const b = await readBody(request)
    const status = String((b && b.status) || '')
    if (!['success', 'pending', 'failed'].includes(status)) return json({ message: 'สถานะไม่ถูกต้อง' }, 400)
    const row = await db.prepare('UPDATE orders SET status = ? WHERE id = ? RETURNING id, status').bind(status, Number(ordMatch[1])).first()
    if (!row) return json({ message: 'ไม่พบออเดอร์' }, 404)
    return json({ ok: true, id: row.id, status: row.status })
  }

  // ---- members ----
  if (path === '/api/admin/users' && request.method === 'GET') {
    const qRaw = (url.searchParams.get('q') || '').trim().slice(0, 60)
    const like = '%' + qRaw.replace(/[%_]/g, '') + '%'
    const rows = await db.prepare(
      `SELECT u.id, u.email, u.name, u.points, u.redeem_credit, u.banned, u.line_id, u.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status = 'success') AS orders_n,
        (SELECT COALESCE(SUM(price),0) FROM orders o WHERE o.user_id = u.id AND o.status = 'success') AS spent
       FROM users u
       WHERE (? = '' OR u.email LIKE ? OR u.name LIKE ?)
       ORDER BY u.id DESC LIMIT 150`,
    ).bind(qRaw, like, like).all()
    return json({ users: rows.results || [] })
  }
  const usrMatch = path.match(/^\/api\/admin\/users\/(\d{1,10})$/)
  if (usrMatch && request.method === 'POST') {
    const id = Number(usrMatch[1])
    const b = await readBody(request)
    const target = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
    if (!target) return json({ message: 'ไม่พบสมาชิก' }, 404)
    const pointsDelta = Math.trunc(Number((b && b.pointsDelta) || 0)) || 0
    const creditDelta = Math.trunc(Number((b && b.creditDelta) || 0)) || 0
    const banned = (b && typeof b.banned === 'boolean') ? (b.banned ? 1 : 0) : target.banned
    const row = await db.prepare(
      'UPDATE users SET points = MAX(0, points + ?), redeem_credit = MAX(0, redeem_credit + ?), banned = ? WHERE id = ? RETURNING id, points, redeem_credit, banned',
    ).bind(pointsDelta, creditDelta, banned, id).first()
    return json({ ok: true, user: row })
  }

  // ---- coupons ----
  if (path === '/api/admin/coupons' && request.method === 'GET') {
    const rows = await db.prepare('SELECT * FROM coupons ORDER BY rowid DESC LIMIT 200').all()
    return json({ coupons: rows.results || [] })
  }
  if (path === '/api/admin/coupons' && request.method === 'POST') {
    const b = await readBody(request)
    const code = String((b && b.code) || '').trim().toUpperCase().slice(0, 20)
    const type = (b && b.type) === 'fixed' ? 'fixed' : 'pct'
    const value = Math.trunc(Number((b && b.value) || 0))
    const minPrice = Math.max(0, Math.trunc(Number((b && b.minPrice) || 0)))
    const active = (b && b.active === false) ? 0 : 1
    const label = String((b && b.label) || '').trim().slice(0, 100)
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return json({ message: 'โค้ดต้องเป็น A-Z/0-9 ยาว 3–20 ตัว' }, 400)
    if (type === 'pct' && (value < 1 || value > 90)) return json({ message: 'ส่วนลด % ต้องอยู่ระหว่าง 1–90' }, 400)
    if (type === 'fixed' && (value < 1 || value > 100000)) return json({ message: 'ส่วนลดบาทต้องอยู่ระหว่าง 1–100,000' }, 400)
    await db.prepare(
      `INSERT INTO coupons (code, type, value, label, min_price, active) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(code) DO UPDATE SET type = ?, value = ?, label = ?, min_price = ?, active = ?`,
    ).bind(code, type, value, label, minPrice, active, type, value, label, minPrice, active).run()
    return json({ ok: true })
  }
  const cpnMatch = path.match(/^\/api\/admin\/coupons\/([A-Z0-9]{3,20})$/)
  if (cpnMatch && request.method === 'DELETE') {
    await db.prepare('DELETE FROM coupons WHERE code = ?').bind(cpnMatch[1]).run()
    return json({ ok: true })
  }

  // ---- site settings (marquee ticker) ----
  if (path === '/api/admin/settings/ticker' && request.method === 'PUT') {
    const b = await readBody(request)
    const items = (Array.isArray(b && b.items) ? b.items : [])
      .map((t) => String(t).trim().slice(0, 200)).filter(Boolean).slice(0, 12)
    if (items.length === 0) await db.prepare("DELETE FROM settings WHERE key = 'ticker'").run()
    else await db.prepare("INSERT INTO settings (key, value) VALUES ('ticker', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .bind(JSON.stringify(items), JSON.stringify(items)).run()
    return json({ ok: true, ticker: items })
  }

  // Per-game packages: PUT replaces the game's package list, DELETE reverts
  // the game to the built-in defaults.
  const pkgMatch = path.match(/^\/api\/admin\/packages\/([a-z0-9_-]{1,40})$/)
  if (pkgMatch) {
    const gid = pkgMatch[1]
    if (request.method === 'PUT') {
      const b = await readBody(request)
      const list = Array.isArray(b && b.packages) ? b.packages.slice(0, 12) : null
      if (!list || list.length === 0) return json({ message: 'ต้องมีแพ็กเกจอย่างน้อย 1 รายการ' }, 400)
      const rows = []
      for (const [i, p] of list.entries()) {
        const amount = String((p && p.amount) || '').trim().slice(0, 20)
        const price = Math.round(Number(p && p.price))
        const bonus = Math.max(0, Math.round(Number((p && p.bonus) || 0)))
        const tag = String((p && p.tag) || '').trim().slice(0, 20)
        if (!amount || !Number.isFinite(price) || price < 1 || price > 1000000) {
          return json({ message: `แถวที่ ${i + 1}: กรอกจำนวนและราคาให้ถูกต้อง (ราคา 1–1,000,000)` }, 400)
        }
        rows.push({ amount, price, bonus, tag, sort: i })
      }
      await db.prepare('DELETE FROM packages WHERE gid = ?').bind(gid).run()
      await db.batch(rows.map((r) =>
        db.prepare('INSERT INTO packages (gid, amount, price, bonus, tag, sort) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(gid, r.amount, r.price, r.bonus, r.tag, r.sort)))
      return handleContent(env, '/api/packages')
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM packages WHERE gid = ?').bind(gid).run()
      return handleContent(env, '/api/packages')
    }
  }

  // Articles CRUD.
  if (path === '/api/admin/articles' && request.method === 'GET') {
    const rows = await db.prepare('SELECT * FROM articles ORDER BY id DESC LIMIT 200').all()
    return json({ articles: rows.results || [] })
  }
  const artBody = async () => {
    const b = await readBody(request)
    const title = String((b && b.title) || '').trim().slice(0, 200)
    const cat = String((b && b.cat) || 'อัปเดต').trim().slice(0, 30)
    const excerpt = String((b && b.excerpt) || '').trim().slice(0, 500)
    const body = String((b && b.body) || '').trim().slice(0, 20000)
    const published = (b && b.published) ? 1 : 0
    if (!title || !body) return { error: json({ message: 'กรอกหัวข้อและเนื้อหาให้ครบ' }, 400) }
    return { title, cat, excerpt, body, published }
  }
  if (path === '/api/admin/articles' && request.method === 'POST') {
    const a = await artBody()
    if (a.error) return a.error
    const row = await db.prepare(
      'INSERT INTO articles (cat, title, excerpt, body, published) VALUES (?, ?, ?, ?, ?) RETURNING *',
    ).bind(a.cat, a.title, a.excerpt, a.body, a.published).first()
    return json({ article: row })
  }
  const artMatch = path.match(/^\/api\/admin\/articles\/(\d{1,10})$/)
  if (artMatch) {
    const id = Number(artMatch[1])
    if (request.method === 'PUT') {
      const a = await artBody()
      if (a.error) return a.error
      const row = await db.prepare(
        'UPDATE articles SET cat = ?, title = ?, excerpt = ?, body = ?, published = ? WHERE id = ? RETURNING *',
      ).bind(a.cat, a.title, a.excerpt, a.body, a.published, id).first()
      if (!row) return json({ message: 'ไม่พบบทความ' }, 404)
      return json({ article: row })
    }
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM articles WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }
  }

  return json({ message: 'not found' }, 404)
}

// ── membership API router ───────────────────────────────────────────────────
async function handleAccount(request, env, path) {
  if (!env.DB) return json({ message: 'ระบบสมาชิกยังไม่พร้อมใช้งาน (ยังไม่ได้ตั้งค่าฐานข้อมูล)' }, 503)
  const db = env.DB
  await ensureSchema(db)

  if (path === '/api/auth/register' && request.method === 'POST') {
    const b = await readBody(request)
    const email = ((b && b.email) || '').trim().toLowerCase()
    const password = (b && b.password) || ''
    const name = ((b && b.name) || '').trim().slice(0, 60)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }, 400)
    if (password.length < 6) return json({ message: 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร' }, 400)
    const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (exists) return json({ message: 'อีเมลนี้สมัครไว้แล้ว — ลองเข้าสู่ระบบแทน' }, 409)
    const salt = randomToken().slice(0, 32)
    const passHash = await hashPassword(password, salt)
    const ins = await db.prepare(
      'INSERT INTO users (email, name, pass_hash, salt) VALUES (?, ?, ?, ?) RETURNING *',
    ).bind(email, name, passHash, salt).first()
    const token = randomToken()
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(token, ins.id, Date.now() + SESSION_DAYS * 86400000).run()
    return json(await mePayload(db, ins, env), 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) })
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    const b = await readBody(request)
    const email = ((b && b.email) || '').trim().toLowerCase()
    const password = (b && b.password) || ''
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    if (!user) return json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
    const passHash = await hashPassword(password, user.salt)
    if (passHash !== user.pass_hash) return json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
    if (user.banned) return json({ message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อทีมงาน' }, 403)
    const token = randomToken()
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(token, user.id, Date.now() + SESSION_DAYS * 86400000).run()
    return json(await mePayload(db, user, env), 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) })
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = getCookie(request, SESSION_COOKIE)
    if (token) await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) })
  }

  // Coupon validation — server-authoritative. Admin coupons take over from
  // the built-in demo codes as soon as the first one exists.
  if (path === '/api/coupons/validate' && request.method === 'POST') {
    const b = await readBody(request)
    const code = String((b && b.code) || '').trim().toUpperCase().slice(0, 20)
    const price = Math.max(0, Number((b && b.price) || 0))
    if (!code) return json({ message: 'กรอกโค้ดก่อน' }, 400)
    const n = await db.prepare('SELECT COUNT(*) AS n FROM coupons').first()
    if (n.n > 0) {
      const c = await db.prepare('SELECT * FROM coupons WHERE code = ?').bind(code).first()
      if (!c || !c.active) return json({ message: 'ไม่พบโค้ดนี้ ลองใหม่อีกครั้ง' }, 400)
      if (price < c.min_price) return json({ message: `โค้ดนี้ใช้ได้กับยอดขั้นต่ำ ฿${c.min_price}` }, 400)
      return json({ code: c.code, type: c.type, value: c.value, label: couponLabel(c.type, c.value, c.label) })
    }
    const d = DEFAULT_COUPONS[code]
    if (!d) return json({ message: 'ไม่พบโค้ดนี้ ลองใหม่อีกครั้ง' }, 400)
    return json({ code, ...d })
  }

  // Everything below requires a session.
  const user = await currentUser(db, request)
  if (path === '/api/me' && request.method === 'GET') {
    if (!user || user.banned) return json({ user: null }, 200)
    return json(await mePayload(db, user, env))
  }
  if (!user) return json({ message: 'กรุณาเข้าสู่ระบบ' }, 401)
  if (user.banned) return json({ message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อทีมงาน' }, 403)

  if (path === '/api/me/favorites' && request.method === 'POST') {
    const b = await readBody(request)
    const gameId = ((b && b.gameId) || '').slice(0, 40)
    if (!gameId) return json({ message: 'gameId required' }, 400)
    if (b.faved) {
      await db.prepare('INSERT OR IGNORE INTO favorites (user_id, game_id) VALUES (?, ?)').bind(user.id, gameId).run()
    } else {
      await db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?').bind(user.id, gameId).run()
    }
    return json({ ok: true })
  }

  if (path === '/api/me/checkin' && request.method === 'POST') {
    const today = bkkToday()
    if (user.last_checkin === today) return json({ message: 'วันนี้เช็คอินแล้ว' }, 409)
    const nextDay = (user.checked_days % 7) + 1
    const reward = nextDay === 7 ? 100 : 20
    const updated = await db.prepare(
      'UPDATE users SET checked_days = ?, last_checkin = ?, points = points + ? WHERE id = ? RETURNING *',
    ).bind(nextDay, today, reward, user.id).first()
    return json({ points: updated.points, checkedDays: updated.checked_days, claimedToday: true, reward })
  }

  if (path === '/api/me/redeem' && request.method === 'POST') {
    const b = await readBody(request)
    const opts = { 500: 50, 1000: 120, 2000: 280 } // cost -> credit, server-authoritative
    const cost = Number(b && b.cost)
    const credit = opts[cost]
    if (!credit) return json({ message: 'ตัวเลือกแลกแต้มไม่ถูกต้อง' }, 400)
    if (user.points < cost) return json({ message: 'แต้มไม่พอ' }, 400)
    const updated = await db.prepare(
      'UPDATE users SET points = points - ?, redeem_credit = redeem_credit + ? WHERE id = ? AND points >= ? RETURNING *',
    ).bind(cost, credit, user.id, cost).first()
    if (!updated) return json({ message: 'แต้มไม่พอ' }, 400)
    return json({ points: updated.points, redeemCredit: updated.redeem_credit })
  }

  if (path === '/api/orders' && request.method === 'POST') {
    const b = await readBody(request)
    const gid = ((b && b.gid) || '').slice(0, 40)
    const pkg = ((b && b.pkg) || '').slice(0, 20)
    const ref = ((b && b.ref) || '').slice(0, 30)
    const amount = ((b && b.amount) || '').slice(0, 20)
    const price = Math.max(0, Math.min(1000000, Number((b && b.price) || 0)))
    const creditUsed = Math.max(0, Math.min(user.redeem_credit, Number((b && b.creditUsed) || 0)))
    const couponCode = String((b && b.couponCode) || '').trim().toUpperCase().slice(0, 20)
    if (!gid || !pkg || !ref) return json({ message: 'ข้อมูลออเดอร์ไม่ครบ' }, 400)
    // Record the order, earn 1 point per ฿10, burn any credit that was applied.
    const earned = Math.floor(price / 10)
    const stmts = [
      db.prepare('INSERT INTO orders (user_id, gid, pkg, ref, price, amount) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(user.id, gid, pkg, ref, price, amount),
      db.prepare('UPDATE users SET points = points + ?, redeem_credit = redeem_credit - ? WHERE id = ?')
        .bind(earned, creditUsed, user.id),
    ]
    if (couponCode) stmts.push(db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').bind(couponCode))
    await db.batch(stmts)
    const fresh = await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first()
    return json(await mePayload(db, fresh, env))
  }

  return json({ message: 'not found' }, 404)
}

// ── worker entry ────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/health') {
      return json({ ok: true, hasKey: !!env.ANTHROPIC_API_KEY, hasDb: !!env.DB, hasLine: !!(env.LINE_CHANNEL_ID && env.LINE_CHANNEL_SECRET), model: env.ANTHROPIC_MODEL || 'claude-sonnet-5' })
    }

    if (path.startsWith('/api/auth/line/')) {
      try {
        return await handleLine(request, env, path, url)
      } catch (err) {
        console.error('[line]', path, err && err.message)
        return json({ message: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, 500)
      }
    }

    if (path === '/api/packages' || path === '/api/articles' || path === '/api/site') {
      try {
        return await handleContent(env, path)
      } catch (err) {
        console.error('[content]', path, err && err.message)
        return json({ message: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, 500)
      }
    }

    if (path.startsWith('/api/admin/')) {
      try {
        return await handleAdmin(request, env, path, url)
      } catch (err) {
        console.error('[admin]', path, err && err.message)
        return json({ message: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, 500)
      }
    }

    if (path.startsWith('/api/auth/') || path === '/api/me' || path.startsWith('/api/me/') || path === '/api/orders' || path === '/api/coupons/validate') {
      try {
        return await handleAccount(request, env, path)
      } catch (err) {
        console.error('[account]', path, err && err.message)
        return json({ message: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }, 500)
      }
    }

    if (path === '/api/chat') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      let prompt = ''
      try {
        const body = await request.json()
        prompt = (body && body.prompt) || ''
      } catch {
        return json({ error: 'bad_json' }, 400)
      }
      if (!prompt.trim()) return json({ error: 'prompt required' }, 400)
      if (!env.ANTHROPIC_API_KEY) return json({ error: 'no_api_key' }, 503)

      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: env.ANTHROPIC_MODEL || 'claude-sonnet-5',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        if (!resp.ok) {
          console.error('[chat] Anthropic API', resp.status, await resp.text())
          return json({ error: 'upstream_failed' }, 502)
        }
        const data = await resp.json()
        const text = (data.content || [])
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('')
          .trim()
        return json({ text })
      } catch (err) {
        console.error('[chat] Anthropic call failed:', err && err.message)
        return json({ error: 'upstream_failed' }, 502)
      }
    }

    // Everything else: static assets (dist/), with SPA fallback per wrangler.jsonc.
    return env.ASSETS.fetch(request)
  },
}
