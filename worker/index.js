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
}
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

async function mePayload(db, user) {
  const favs = await db.prepare('SELECT game_id FROM favorites WHERE user_id = ?').bind(user.id).all()
  const orders = await db.prepare(
    'SELECT gid, pkg, status, ref, price, created_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 30',
  ).bind(user.id).all()
  return {
    user: { email: user.email, name: user.name || '' },
    points: user.points,
    redeemCredit: user.redeem_credit,
    checkedDays: user.checked_days,
    claimedToday: user.last_checkin === bkkToday(),
    favorites: (favs.results || []).map((r) => r.game_id),
    orders: (orders.results || []).map((o) => ({
      gid: o.gid, pkg: o.pkg, status: o.status, ref: o.ref, price: o.price, createdAt: o.created_at,
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
    return json(await mePayload(db, ins), 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) })
  }

  if (path === '/api/auth/login' && request.method === 'POST') {
    const b = await readBody(request)
    const email = ((b && b.email) || '').trim().toLowerCase()
    const password = (b && b.password) || ''
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    if (!user) return json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
    const passHash = await hashPassword(password, user.salt)
    if (passHash !== user.pass_hash) return json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, 401)
    const token = randomToken()
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(token, user.id, Date.now() + SESSION_DAYS * 86400000).run()
    return json(await mePayload(db, user), 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) })
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = getCookie(request, SESSION_COOKIE)
    if (token) await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) })
  }

  // Everything below requires a session.
  const user = await currentUser(db, request)
  if (path === '/api/me' && request.method === 'GET') {
    if (!user) return json({ user: null }, 200)
    return json(await mePayload(db, user))
  }
  if (!user) return json({ message: 'กรุณาเข้าสู่ระบบ' }, 401)

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
    const price = Math.max(0, Math.min(1000000, Number((b && b.price) || 0)))
    const creditUsed = Math.max(0, Math.min(user.redeem_credit, Number((b && b.creditUsed) || 0)))
    if (!gid || !pkg || !ref) return json({ message: 'ข้อมูลออเดอร์ไม่ครบ' }, 400)
    // Record the order, earn 1 point per ฿10, burn any credit that was applied.
    const earned = Math.floor(price / 10)
    await db.batch([
      db.prepare('INSERT INTO orders (user_id, gid, pkg, ref, price) VALUES (?, ?, ?, ?, ?)')
        .bind(user.id, gid, pkg, ref, price),
      db.prepare('UPDATE users SET points = points + ?, redeem_credit = redeem_credit - ? WHERE id = ?')
        .bind(earned, creditUsed, user.id),
    ])
    const fresh = await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first()
    return json(await mePayload(db, fresh))
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

    if (path.startsWith('/api/auth/') || path === '/api/me' || path.startsWith('/api/me/') || path === '/api/orders') {
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
