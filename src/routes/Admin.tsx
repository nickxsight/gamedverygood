import { useEffect, useRef, useState } from 'react'
import type { Vals } from '../vals'
import { useStore } from '../store'
import { GAMES, PKGS, NEWS, mergedGames } from '../data'
import { css } from '../css'

// Admin backoffice: overview, order queue, members, per-game pricing,
// coupons, news CMS, and site marquee. Server-side authorization is the real
// gate (ADMIN_EMAILS allowlist); this component just mirrors it in the UI.

const card: React.CSSProperties = { backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22 }
const inputS: React.CSSProperties = { height: 42, padding: '0 12px', background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 10, color: 'var(--t1,#eef0f5)', fontSize: 13.5, fontFamily: "'IBM Plex Sans Thai'", outline: 'none', width: '100%' }
const btnAcc: React.CSSProperties = { cursor: 'pointer', height: 42, padding: '0 20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--acc,#4f46e5)', borderRadius: 11, fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }
const btnGhost: React.CSSProperties = { cursor: 'pointer', height: 42, padding: '0 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--t2b,#c4c8d2)', whiteSpace: 'nowrap' }
const label = (t: string) => <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>{t}</label>

async function call(path: string, method = 'GET', body?: unknown) {
  const resp = await fetch(path, body === undefined
    ? { method }
    : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, data }
}

const GameBadge = ({ g }: { g: any }) => {
  return <div style={css('width:34px;height:34px;border-radius:9px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\';font-weight:700;font-size:10px;color:#fff;background:linear-gradient(140deg,' + (g?.c1 || '#666') + ',' + (g?.c2 || '#444') + ');')}>{g?.short || '?'}</div>
}
const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  success: { label: 'สำเร็จ', color: 'var(--ok,#4ade80)' },
  pending: { label: 'กำลังดำเนินการ', color: '#fb923c' },
  failed: { label: 'ไม่สำเร็จ', color: '#f87171' },
}
type PkgRow = { amount: string; price: string; bonus: string; tag: string }
const NEWS_CATS = ['อัปเดต', 'อีสปอร์ต', 'รีวิว', 'โปรโมชั่น', 'ไกด์']

// Upload box for one artwork slot — shows the live image (or the branded
// gradient fallback), click to pick a file, hover to remove.
function SlotBox({ slotId, w, h, grad, short, caption, fit = 'cover' }: { slotId: string; w: number; h: number; grad: string; short: string; caption: string; fit?: 'cover' | 'contain' }) {
  const ts = useStore((s) => s.serverImages[slotId])
  const uploadSlotImage = useStore((s) => s.uploadSlotImage)
  const removeSlotImage = useStore((s) => s.removeSlotImage)
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  return (
    <div style={{ width: w, flexShrink: 0 }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => { e.preventDefault(); setBusy(true); await uploadSlotImage(slotId, e.dataTransfer?.files?.[0]); setBusy(false) }}
        title="คลิกหรือลากรูปมาวางเพื่ออัปโหลด"
        style={{ position: 'relative', width: w, height: h, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: '1.5px dashed ' + (ts ? 'transparent' : 'rgba(124,131,255,.45)'), background: grad, display: 'grid', placeItems: 'center', opacity: busy ? .5 : 1 }}
      >
        {ts
          ? <img src={`/api/images/${slotId}?v=${ts}`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, background: fit === 'contain' ? '#fff' : undefined }} />
          : <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,.9)' }}>{short}</span>}
        {!ts && <span style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.85)' }}>+ อัปโหลด</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 11, color: 'var(--t3,#878e9a)' }}>{caption}</span>
        {ts && <span onClick={() => { if (window.confirm('ลบรูปนี้?')) removeSlotImage(slotId) }} style={{ cursor: 'pointer', fontSize: 11, color: '#f87171' }}>ลบ</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden
        onChange={async (e) => { setBusy(true); await uploadSlotImage(slotId, e.target.files?.[0]); setBusy(false); e.target.value = '' }} />
    </div>
  )
}
const DEFAULT_TICKER = [
  '🎁 สมัครสมาชิกใหม่รับ 100 แต้มทันที',
  '🎟️ ใช้โค้ด WELCOME10 ลด 10% สำหรับสมาชิกใหม่',
  '👑 สะสมแต้มทุกการเติม แลกเป็นเครดิตได้',
  '🤝 ชวนเพื่อนมาเติม รับเครดิตคนละ ฿50',
  '💬 มีคำถาม? ทักแชทหาทีมงานได้ตลอด',
]

export default function Admin({ v }: { v: Vals }) {
  const showToast = useStore((s) => s.showToast)
  const loadContent = useStore((s) => s.loadContent)
  const applyPackages = useStore((s) => s.applyPackages)
  const pkgMap = useStore((s) => s.pkgMap)
  const siteTicker = useStore((s) => s.siteTicker)
  const customGames = useStore((s) => s.customGames)
  const hiddenGames = useStore((s) => s.hiddenGames)
  const gamesAll = mergedGames(customGames, hiddenGames)
  const findGame = (id: string) => gamesAll.find((x) => x.id === id) || GAMES.find((x) => x.id === id)

  const [tab, setTab] = useState<'overview' | 'orders' | 'users' | 'games' | 'pkgs' | 'coupons' | 'news' | 'images' | 'site'>('overview')
  const [overview, setOverview] = useState<any>(null)

  // orders
  const [ordStatus, setOrdStatus] = useState('all')
  const [ordQ, setOrdQ] = useState('')
  const [ordList, setOrdList] = useState<any[]>([])
  // users
  const [usrQ, setUsrQ] = useState('')
  const [usrList, setUsrList] = useState<any[]>([])
  // packages
  const [gid, setGid] = useState(GAMES[0].id)
  const [rows, setRows] = useState<PkgRow[]>([])
  const [pkgBusy, setPkgBusy] = useState(false)
  // coupons
  const [coupons, setCoupons] = useState<any[]>([])
  const [cpn, setCpn] = useState({ code: '', type: 'pct', value: '', minPrice: '0', label: '' })
  // news
  const [articles, setArticles] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  // games
  const [gForm, setGForm] = useState<any | null>(null)
  // site
  const [tickerText, setTickerText] = useState('')

  const custom = !!(pkgMap[gid] && pkgMap[gid].length)
  useEffect(() => {
    const src = pkgMap[gid] && pkgMap[gid].length ? pkgMap[gid] : PKGS
    setRows(src.map((p) => ({ amount: p.amount, price: String(p.price), bonus: String(p.bonus), tag: p.tag })))
  }, [gid, pkgMap])

  const loadOrders = (status = ordStatus, q = ordQ) =>
    call(`/api/admin/orders?status=${status}&q=${encodeURIComponent(q)}`).then((r) => { if (r.ok) setOrdList(r.data.orders || []) })
  const loadUsers = (q = usrQ) =>
    call(`/api/admin/users?q=${encodeURIComponent(q)}`).then((r) => { if (r.ok) setUsrList(r.data.users || []) })
  const loadCoupons = () => call('/api/admin/coupons').then((r) => { if (r.ok) setCoupons(r.data.coupons || []) })
  const loadArticles = () => call('/api/admin/articles').then((r) => { if (r.ok) setArticles(r.data.articles || []) })

  useEffect(() => {
    if (!v.isAdmin) return
    call('/api/admin/overview').then((r) => { if (r.ok) setOverview(r.data) })
    loadOrders(); loadUsers(); loadCoupons(); loadArticles()
    setTickerText((siteTicker && siteTicker.length ? siteTicker : DEFAULT_TICKER).join('\n'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.isAdmin])

  if (!v.isMember || !v.isAdmin) {
    return (
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '80px var(--wrap-pad,28px) 0', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔐</div>
        <h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 28, margin: '0 0 10px' }}>เฉพาะผู้ดูแลระบบ</h1>
        <p style={{ fontSize: 14, color: 'var(--t3,#878e9a)', lineHeight: 1.7 }}>
          {v.isMember
            ? 'บัญชีนี้ไม่มีสิทธิ์แอดมิน — เพิ่มอีเมลของคุณใน ADMIN_EMAILS (Cloudflare → Worker → Settings → Variables and Secrets) แล้วล็อกอินใหม่'
            : 'กรุณาเข้าสู่ระบบด้วยบัญชีแอดมินก่อน'}
        </p>
        {!v.isMember && <div onClick={v.openLogin} style={{ ...btnAcc, marginTop: 18 }}>เข้าสู่ระบบ</div>}
      </section>
    )
  }

  const game = gamesAll.find((x) => x.id === gid) || gamesAll[0]

  const savePkgs = async () => {
    setPkgBusy(true)
    const r = await call('/api/admin/packages/' + gid, 'PUT', {
      packages: rows.map((x) => ({ amount: x.amount, price: Number(x.price), bonus: Number(x.bonus) || 0, tag: x.tag })),
    })
    setPkgBusy(false)
    if (r.ok) { applyPackages(r.data.packages || {}); showToast('บันทึกราคา ' + game.name + ' แล้ว', '✓') }
    else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
  }
  const resetPkgs = async () => {
    setPkgBusy(true)
    const r = await call('/api/admin/packages/' + gid, 'DELETE')
    setPkgBusy(false)
    if (r.ok) { applyPackages(r.data.packages || {}); showToast('กลับไปใช้ราคาเริ่มต้นแล้ว', '↺') }
  }

  const setOrderStatus = async (id: number, status: string) => {
    const r = await call('/api/admin/orders/' + id, 'POST', { status })
    if (r.ok) {
      setOrdList((l) => l.map((o) => o.id === id ? { ...o, status } : o))
      showToast('อัปเดตสถานะออเดอร์แล้ว', '✓')
    } else showToast(r.data.message || 'อัปเดตไม่สำเร็จ', '⚠️')
  }

  const adjustUser = async (u: any, patch: { pointsDelta?: number; creditDelta?: number; banned?: boolean }) => {
    const r = await call('/api/admin/users/' + u.id, 'POST', patch)
    if (r.ok) {
      setUsrList((l) => l.map((x) => x.id === u.id ? { ...x, points: r.data.user.points, redeem_credit: r.data.user.redeem_credit, banned: r.data.user.banned } : x))
      showToast('อัปเดตสมาชิกแล้ว', '✓')
    } else showToast(r.data.message || 'อัปเดตไม่สำเร็จ', '⚠️')
  }
  const promptAdjust = (u: any, kind: 'points' | 'credit') => {
    const raw = window.prompt(kind === 'points'
      ? `ปรับแต้มของ ${u.name || u.email} (ใส่จำนวน เช่น 100 หรือ -50)`
      : `ปรับเครดิต ฿ ของ ${u.name || u.email} (เช่น 50 หรือ -20)`)
    if (raw == null) return
    const n = Math.trunc(Number(raw))
    if (!n) { showToast('กรอกตัวเลขไม่ถูกต้อง', '⚠️'); return }
    adjustUser(u, kind === 'points' ? { pointsDelta: n } : { creditDelta: n })
  }

  const saveCoupon = async () => {
    const r = await call('/api/admin/coupons', 'POST', {
      code: cpn.code, type: cpn.type, value: Number(cpn.value), minPrice: Number(cpn.minPrice) || 0, label: cpn.label, active: true,
    })
    if (r.ok) { setCpn({ code: '', type: 'pct', value: '', minPrice: '0', label: '' }); loadCoupons(); loadContent(); showToast('บันทึกคูปองแล้ว', '🎟️') }
    else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
  }
  const toggleCoupon = async (c: any) => {
    const r = await call('/api/admin/coupons', 'POST', { code: c.code, type: c.type, value: c.value, minPrice: c.min_price, label: c.label, active: !c.active })
    if (r.ok) loadCoupons()
  }
  const deleteCoupon = async (code: string) => {
    if (!window.confirm(`ลบคูปอง ${code}?`)) return
    const r = await call('/api/admin/coupons/' + code, 'DELETE')
    if (r.ok) { loadCoupons(); loadContent(); showToast('ลบคูปองแล้ว', '🗑️') }
  }

  const saveArticle = async () => {
    const isNew = !editing.id
    const r = await call(isNew ? '/api/admin/articles' : '/api/admin/articles/' + editing.id, isNew ? 'POST' : 'PUT', {
      title: editing.title, cat: editing.cat || 'อัปเดต', excerpt: editing.excerpt, body: editing.body, published: !!editing.published,
    })
    if (r.ok) {
      setEditing(null)
      showToast(isNew ? 'บันทึกบทความแล้ว' : 'บันทึกการแก้ไขแล้ว', '✓')
      loadArticles(); loadContent()
    } else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
  }
  const deleteArticle = async (id: number) => {
    if (!window.confirm('ลบบทความนี้ถาวร?')) return
    const r = await call('/api/admin/articles/' + id, 'DELETE')
    if (r.ok) { setArticles((a) => a.filter((x) => x.id !== id)); showToast('ลบบทความแล้ว', '🗑️'); loadContent() }
  }

  const saveTicker = async () => {
    const items = tickerText.split('\n').map((t) => t.trim()).filter(Boolean)
    const r = await call('/api/admin/settings/ticker', 'PUT', { items })
    if (r.ok) { loadContent(); showToast(items.length ? 'บันทึกข้อความแถบวิ่งแล้ว' : 'กลับไปใช้ข้อความเริ่มต้น', '✓') }
    else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
  }

  const tabBtn = (key: typeof tab, lbl: string, badge?: number) => (
    <div key={key} onClick={() => setTab(key)} style={{ position: 'relative', cursor: 'pointer', padding: '9px 18px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, transition: 'all .2s', whiteSpace: 'nowrap', background: tab === key ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)', color: tab === key ? '#fff' : 'var(--t2,#9aa1ad)', border: `1.5px solid ${tab === key ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'}` }}>
      {lbl}
      {!!badge && <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 99, background: '#fb923c', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{badge}</span>}
    </div>
  )

  return (
    <section data-screen-label="Admin" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>BACKOFFICE</div>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-1.2px' }}>หลังบ้านผู้ดูแล</h1>
      </div>
      <div className="gvg-scroll" style={{ display: 'flex', gap: 10, marginBottom: 26, overflowX: 'auto', paddingBottom: 6 }}>
        {tabBtn('overview', '📊 ภาพรวม')}
        {tabBtn('orders', '📦 ออเดอร์', overview?.pending || 0)}
        {tabBtn('users', '👥 สมาชิก')}
        {tabBtn('games', '🎮 เกม')}
        {tabBtn('pkgs', '💰 แพ็กเกจ & ราคา')}
        {tabBtn('coupons', '🎟️ คูปอง')}
        {tabBtn('news', '📰 ข่าว & บทความ')}
        {tabBtn('images', '🖼️ รูปภาพ')}
        {tabBtn('site', '📣 แถบประกาศ')}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <div>
          <div data-resp="g4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 26 }}>
            {[
              { label: 'สมาชิกทั้งหมด', value: overview ? overview.users.toLocaleString() : '…', color: 'var(--acc,#4f46e5)' },
              { label: 'ออเดอร์สำเร็จ', value: overview ? overview.orders.toLocaleString() : '…', color: 'var(--ok,#4ade80)' },
              { label: 'รอดำเนินการ', value: overview ? (overview.pending || 0).toLocaleString() : '…', color: '#fb923c' },
              { label: 'ยอดขายรวม', value: overview ? '฿' + overview.revenue.toLocaleString() : '…', color: 'var(--t1,#eef0f5)' },
            ].map((a, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginBottom: 8 }}>{a.label}</div>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 26, color: a.color }}>{a.value}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>ออเดอร์ล่าสุด</div>
            {(!overview || overview.latest.length === 0) && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5, padding: '14px 0' }}>ยังไม่มีออเดอร์</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(overview?.latest || []).map((o: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap' }}>
                  <GameBadge g={findGame(o.gid)} />
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 600 }}>{findGame(o.gid)?.name || o.gid} · {o.amount || o.pkg}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{o.buyer} · {o.ref}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ORDER_STATUS[o.status]?.color || 'var(--t3)' }}>{ORDER_STATUS[o.status]?.label || o.status}</span>
                  <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700 }}>฿{o.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ORDERS QUEUE ===== */}
      {tab === 'orders' && (
        <div style={card}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            {['all', 'pending', 'success', 'failed'].map((stt) => (
              <div key={stt} onClick={() => { setOrdStatus(stt); loadOrders(stt, ordQ) }} style={{ cursor: 'pointer', padding: '8px 15px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: ordStatus === stt ? 'var(--acc,#4f46e5)' : 'var(--s-inset,#161922)', color: ordStatus === stt ? '#fff' : 'var(--t2,#9aa1ad)', border: '1px solid ' + (ordStatus === stt ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))') }}>
                {stt === 'all' ? 'ทั้งหมด' : ORDER_STATUS[stt].label}
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 180, display: 'flex', gap: 8 }}>
              <input value={ordQ} onChange={(e) => setOrdQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') loadOrders(ordStatus, ordQ) }} placeholder="ค้นหาเลขอ้างอิง / อีเมล / ชื่อ..." style={inputS} />
              <div onClick={() => loadOrders(ordStatus, ordQ)} style={btnGhost}>ค้นหา</div>
              <a href="/api/admin/export/orders.csv" style={{ ...btnGhost, textDecoration: 'none' }}>⬇️ Export CSV</a>
            </div>
          </div>
          {ordList.length === 0 && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5, padding: '14px 0' }}>ไม่พบออเดอร์</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ordList.map((o) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap' }}>
                <GameBadge g={findGame(o.gid)} />
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 600 }}>{findGame(o.gid)?.name || o.gid} · {o.amount || o.pkg} · ฿{o.price}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{o.name || o.email} · {o.ref} · {o.created_at}</div>
                </div>
                <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} style={{ ...inputS, width: 170, height: 38, color: ORDER_STATUS[o.status]?.color }}>
                  <option value="pending">⏳ กำลังดำเนินการ</option>
                  <option value="success">✅ สำเร็จ</option>
                  <option value="failed">❌ ไม่สำเร็จ</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== MEMBERS ===== */}
      {tab === 'users' && (
        <div style={card}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 460 }}>
            <input value={usrQ} onChange={(e) => setUsrQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') loadUsers(usrQ) }} placeholder="ค้นหาอีเมล / ชื่อ..." style={inputS} />
            <div onClick={() => loadUsers(usrQ)} style={btnGhost}>ค้นหา</div>
          </div>
          {usrList.length === 0 && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5, padding: '14px 0' }}>ไม่พบสมาชิก</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usrList.map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap', opacity: u.banned ? .55 : 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, color: '#fff', background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))' }}>{(u.name || u.email).slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <div style={{ fontWeight: 600 }}>{u.name || 'สมาชิก'} {u.banned ? <span style={{ color: '#f87171', fontSize: 11.5 }}>· ถูกระงับ</span> : null}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{u.email.startsWith('line:') ? 'บัญชี LINE' : u.email} · สมัคร {u.created_at?.slice(0, 10)}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 1.5, color: 'var(--t2,#9aa1ad)' }}>
                  <div>{u.points.toLocaleString()} แต้ม · เครดิต ฿{u.redeem_credit.toLocaleString()}</div>
                  <div>{u.orders_n} ออเดอร์ · ใช้ไป ฿{u.spent.toLocaleString()}</div>
                </div>
                <div onClick={() => promptAdjust(u, 'points')} style={{ ...btnGhost, height: 36, padding: '0 12px', fontSize: 12 }}>± แต้ม</div>
                <div onClick={() => promptAdjust(u, 'credit')} style={{ ...btnGhost, height: 36, padding: '0 12px', fontSize: 12 }}>± เครดิต</div>
                <div onClick={() => { if (window.confirm(u.banned ? 'ปลดระงับบัญชีนี้?' : 'ระงับบัญชีนี้? สมาชิกจะเข้าสู่ระบบไม่ได้')) adjustUser(u, { banned: !u.banned }) }} style={{ ...btnGhost, height: 36, padding: '0 12px', fontSize: 12, color: u.banned ? 'var(--ok,#4ade80)' : '#f87171' }}>{u.banned ? 'ปลดระงับ' : 'ระงับ'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== GAMES ===== */}
      {tab === 'games' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!gForm && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--t3,#878e9a)' }}>เกมที่เพิ่มจะโผล่ทุกหน้าอัตโนมัติ — แล้วไปตั้งราคาที่แท็บ 💰 และใส่รูปที่แท็บ 🖼️</div>
              <div onClick={() => setGForm({ id: '', name: '', short: '', genre: '', currency: '', from: '10', cat: 'moba', platform: 'mobile', alias: '', desc: '', isNew: true, c1: '#6d6af5', c2: '#8b91ff' })} style={btnAcc}>+ เพิ่มเกมใหม่</div>
            </div>
          )}

          {gForm && (
            <div style={card}>
              <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 17, marginBottom: 18 }}>{gForm.id ? 'แก้ไขเกม: ' + gForm.name : 'เพิ่มเกมใหม่'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 150px 160px', gap: 12, marginBottom: 12 }}>
                <div>{label('ชื่อเกม')}<input value={gForm.name} onChange={(e) => setGForm({ ...gForm, name: e.target.value })} placeholder="เช่น Zenless Zone Zero" style={inputS} /></div>
                <div>{label('ชื่อย่อ (2–6 ตัว)')}<input value={gForm.short} onChange={(e) => setGForm({ ...gForm, short: e.target.value.toUpperCase() })} placeholder="ZZZ" style={inputS} /></div>
                <div>{label('หมวด')}<select value={gForm.cat} onChange={(e) => setGForm({ ...gForm, cat: e.target.value })} style={inputS}>
                  <option value="moba">MOBA</option><option value="fps">FPS</option><option value="br">Battle Royale</option><option value="rpg">RPG</option><option value="other">อื่นๆ</option><option value="platform">บัตร & แพลตฟอร์ม</option>
                </select></div>
                <div>{label('แพลตฟอร์ม')}<select value={gForm.platform} onChange={(e) => setGForm({ ...gForm, platform: e.target.value })} style={inputS}>
                  <option value="mobile">มือถือ</option><option value="pc">PC</option><option value="cross">มือถือ + PC</option><option value="platform">บัตรเติม</option>
                </select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 150px 1fr', gap: 12, marginBottom: 12 }}>
                <div>{label('สกุลเงินในเกม')}<input value={gForm.currency} onChange={(e) => setGForm({ ...gForm, currency: e.target.value })} placeholder="เช่น Monochrome" style={inputS} /></div>
                <div>{label('ราคาเริ่มต้น (฿)')}<input value={gForm.from} onChange={(e) => setGForm({ ...gForm, from: e.target.value })} style={inputS} inputMode="numeric" /></div>
                <div>{label('ประเภทเกม (โชว์บนการ์ด)')}<input value={gForm.genre} onChange={(e) => setGForm({ ...gForm, genre: e.target.value })} placeholder="เช่น Action RPG" style={inputS} /></div>
              </div>
              {label('สีการ์ด (ใช้ตอนยังไม่มีรูป)')}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {[['#fb7185', '#f43f5e'], ['#fbbf24', '#f97316'], ['#fbbf24', '#ef4444'], ['#60a5fa', '#3b82f6'], ['#22d3ee', '#6366f1'], ['#38bdf8', '#818cf8'], ['#a78bfa', '#7c3aed'], ['#f472b6', '#db2777'], ['#34d399', '#059669'], ['#84cc16', '#4d7c0f'], ['#fb923c', '#ea580c'], ['#6d6af5', '#8b91ff']].map(([c1, c2]) => (
                  <div key={c1 + c2} onClick={() => setGForm({ ...gForm, c1, c2 })} style={{ width: 38, height: 38, borderRadius: 10, cursor: 'pointer', background: `linear-gradient(140deg,${c1},${c2})`, outline: gForm.c1 === c1 && gForm.c2 === c2 ? '2.5px solid #fff' : 'none', outlineOffset: 2 }} />
                ))}
              </div>
              {label('คำค้นหา (ชื่อไทย/ชื่อย่อ ใช้ตอนลูกค้าเสิร์ช คั่นด้วยช่องว่าง)')}
              <input value={gForm.alias} onChange={(e) => setGForm({ ...gForm, alias: e.target.value })} placeholder="เช่น เซนเลส zzz zone zero" style={{ ...inputS, marginBottom: 12 }} />
              {label('คำอธิบายเกม')}
              <textarea value={gForm.desc} onChange={(e) => setGForm({ ...gForm, desc: e.target.value })} rows={3} placeholder="คำอธิบายสั้นๆ โชว์บนหน้าเกมและสไลด์" style={{ ...inputS, height: 'auto', padding: 12, lineHeight: 1.7, resize: 'vertical' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 18px', fontSize: 13.5, cursor: 'pointer', color: 'var(--t2b,#c4c8d2)' }}>
                <input type="checkbox" checked={!!gForm.isNew} onChange={(e) => setGForm({ ...gForm, isNew: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#6d6af5' }} />
                ติดป้าย NEW บนการ์ด
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <div onClick={async () => {
                  const payload = { ...gForm, from: Number(gForm.from) }
                  const r = await call(gForm.id ? '/api/admin/games/' + gForm.id : '/api/admin/games', gForm.id ? 'PUT' : 'POST', payload)
                  if (r.ok) { setGForm(null); showToast(gForm.id ? 'บันทึกเกมแล้ว' : 'เพิ่มเกมแล้ว — ไปตั้งราคาและใส่รูปต่อได้เลย', '🎮'); loadContent() }
                  else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
                }} style={btnAcc}>{gForm.id ? 'บันทึกการแก้ไข' : 'เพิ่มเกม'}</div>
                <div onClick={() => setGForm(null)} style={btnGhost}>ยกเลิก</div>
              </div>
            </div>
          )}

          {!gForm && (
            <>
              <div style={card}>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>เกมที่คุณเพิ่มเอง ({customGames.length})</div>
                {customGames.length === 0 && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5 }}>ยังไม่มี — กด "+ เพิ่มเกมใหม่" ได้เลย</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {customGames.map((g0) => (
                    <div key={g0.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap' }}>
                      <GameBadge g={g0} />
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontWeight: 600 }}>{g0.name} {g0.isNew && <span style={{ fontSize: 10, fontWeight: 700, color: '#07080d', background: 'var(--ok,#4ade80)', borderRadius: 5, padding: '1px 6px', marginLeft: 4 }}>NEW</span>}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{g0.genre} · {g0.currency} · เริ่ม ฿{g0.from}</div>
                      </div>
                      <div onClick={() => setGForm({ ...g0, from: String(g0.from), isNew: !!g0.isNew })} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12 }}>แก้ไข</div>
                      <div onClick={async () => {
                        if (!window.confirm(`ลบ ${g0.name} ถาวร? (ราคา/รูปของเกมนี้จะถูกลบด้วย)`)) return
                        const r = await call('/api/admin/games/' + g0.id, 'DELETE')
                        if (r.ok) { showToast('ลบเกมแล้ว', '🗑️'); loadContent() }
                      }} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12, color: '#f87171' }}>ลบ</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={card}>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>เกมในระบบ ({GAMES.length})</div>
                <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)', marginBottom: 14 }}>เกมตั้งต้นของเว็บ แก้ไขไม่ได้แต่<b style={{ color: 'var(--t2b,#c4c8d2)' }}>ซ่อนจากหน้าเว็บ</b>ได้ (ซ่อนแล้วลูกค้าไม่เห็น เปิดกลับได้ตลอด)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {GAMES.map((g0) => {
                    const hidden = hiddenGames.includes(g0.id)
                    return (
                      <div key={g0.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap', opacity: hidden ? .45 : 1 }}>
                        <GameBadge g={g0} />
                        <div style={{ flex: 1, minWidth: 150 }}>
                          <div style={{ fontWeight: 600 }}>{g0.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{g0.genre} · {g0.currency}</div>
                        </div>
                        <div onClick={async () => {
                          const next = hidden ? hiddenGames.filter((x) => x !== g0.id) : [...hiddenGames, g0.id]
                          const r = await call('/api/admin/settings/hidden-games', 'PUT', { ids: next })
                          if (r.ok) { showToast(hidden ? 'แสดง ' + g0.name + ' แล้ว' : 'ซ่อน ' + g0.name + ' แล้ว', hidden ? '👁️' : '🙈'); loadContent() }
                        }} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12, color: hidden ? 'var(--ok,#4ade80)' : 'var(--t3,#878e9a)' }}>{hidden ? 'แสดง' : 'ซ่อน'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== PACKAGES & PRICES ===== */}
      {tab === 'pkgs' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
            <div>
              {label('เลือกเกม')}
              <select value={gid} onChange={(e) => setGid(e.target.value)} style={{ ...inputS, width: 260 }}>
                {gamesAll.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.currency})</option>)}
              </select>
            </div>
            <div style={{ paddingTop: 20, fontSize: 12.5, color: custom ? 'var(--ok,#4ade80)' : 'var(--t3b,#6c727e)' }}>
              {custom ? '● ใช้ราคาที่กำหนดเอง' : '○ ใช้ราคาเริ่มต้นของระบบ (แก้แล้วกดบันทึกเพื่อเปลี่ยน)'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 130px 40px', gap: 10, padding: '12px 0 8px', fontSize: 11.5, fontWeight: 700, color: 'var(--t3,#878e9a)', letterSpacing: '.4px' }}>
            <div>จำนวน ({game.currency})</div><div>ราคา (฿)</div><div>โบนัส</div><div>ป้ายกำกับ</div><div />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 130px 40px', gap: 10, alignItems: 'center' }}>
                <input value={r.amount} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} placeholder="เช่น 300" style={inputS} />
                <input value={r.price} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} placeholder="159" style={inputS} inputMode="numeric" />
                <input value={r.bonus} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, bonus: e.target.value } : x))} placeholder="0" style={inputS} inputMode="numeric" />
                <input value={r.tag} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, tag: e.target.value } : x))} placeholder="ยอดนิยม" style={inputS} />
                <div onClick={() => setRows(rows.filter((_, j) => j !== i))} title="ลบแถว" style={{ cursor: 'pointer', height: 42, display: 'grid', placeItems: 'center', color: '#f87171', fontSize: 18 }}>×</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <div onClick={() => setRows([...rows, { amount: '', price: '', bonus: '0', tag: '' }])} style={btnGhost}>+ เพิ่มแถว</div>
            <div style={{ flex: 1 }} />
            {custom && <div onClick={resetPkgs} style={btnGhost}>↺ กลับไปใช้ราคาเริ่มต้น</div>}
            <div onClick={pkgBusy ? undefined : savePkgs} style={{ ...btnAcc, opacity: pkgBusy ? .6 : 1 }}>{pkgBusy ? 'กำลังบันทึก…' : 'บันทึกราคา ' + game.name}</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--t3b,#6c727e)' }}>ราคาที่บันทึกจะมีผลกับหน้าเติมเกมและหน้ารายละเอียดของเกมนี้ทันที · ลูกค้าที่เปิดเว็บอยู่จะเห็นเมื่อรีเฟรช</div>
        </div>
      )}

      {/* ===== COUPONS ===== */}
      {tab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>สร้าง / แก้ไขคูปอง</div>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 110px 130px 1fr auto', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
              <div>{label('โค้ด (A-Z, 0-9)')}<input value={cpn.code} onChange={(e) => setCpn({ ...cpn, code: e.target.value.toUpperCase() })} placeholder="NEWYEAR20" style={inputS} /></div>
              <div>{label('ประเภท')}<select value={cpn.type} onChange={(e) => setCpn({ ...cpn, type: e.target.value })} style={inputS}><option value="pct">ลดเป็น %</option><option value="fixed">ลดเป็นบาท</option></select></div>
              <div>{label(cpn.type === 'pct' ? 'ลด (%)' : 'ลด (฿)')}<input value={cpn.value} onChange={(e) => setCpn({ ...cpn, value: e.target.value })} placeholder={cpn.type === 'pct' ? '20' : '50'} style={inputS} inputMode="numeric" /></div>
              <div>{label('ยอดขั้นต่ำ (฿)')}<input value={cpn.minPrice} onChange={(e) => setCpn({ ...cpn, minPrice: e.target.value })} style={inputS} inputMode="numeric" /></div>
              <div>{label('คำอธิบาย (ไม่บังคับ)')}<input value={cpn.label} onChange={(e) => setCpn({ ...cpn, label: e.target.value })} placeholder="โปรปีใหม่ ลด 20%" style={inputS} /></div>
              <div onClick={saveCoupon} style={btnAcc}>บันทึกคูปอง</div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--t3b,#6c727e)' }}>ใส่โค้ดเดิมซ้ำ = แก้ไขค่าของโค้ดนั้น · เมื่อมีคูปองของคุณอย่างน้อย 1 ใบ โค้ดตัวอย่าง (WELCOME10 ฯลฯ) จะปิดใช้งานอัตโนมัติ</div>
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>คูปองทั้งหมด</div>
            {coupons.length === 0 && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5 }}>ยังไม่มีคูปองของคุณ — ตอนนี้ลูกค้าใช้โค้ดตัวอย่างได้ (WELCOME10 · GVG50 · FLASH20)</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coupons.map((c) => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap', opacity: c.active ? 1 : .55 }}>
                  <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 700, fontSize: 14, color: 'var(--acc,#4f46e5)', minWidth: 110 }}>{c.code}</span>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontWeight: 600 }}>{c.type === 'pct' ? `ลด ${c.value}%` : `ลด ฿${c.value}`}{c.min_price > 0 ? ` · ขั้นต่ำ ฿${c.min_price}` : ''}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{c.label || '—'} · ใช้ไปแล้ว {c.used_count} ครั้ง</div>
                  </div>
                  <div onClick={() => toggleCoupon(c)} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12, color: c.active ? 'var(--ok,#4ade80)' : 'var(--t3,#878e9a)' }}>{c.active ? '● เปิดใช้งาน' : '○ ปิดอยู่'}</div>
                  <div onClick={() => setCpn({ code: c.code, type: c.type, value: String(c.value), minPrice: String(c.min_price), label: c.label })} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12 }}>แก้ไข</div>
                  <div onClick={() => deleteCoupon(c.code)} style={{ ...btnGhost, height: 34, padding: '0 12px', fontSize: 12, color: '#f87171' }}>ลบ</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== NEWS CMS ===== */}
      {tab === 'news' && (
        <div>
          {!editing && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 13, color: 'var(--t3,#878e9a)' }}>
                  {articles.length === 0
                    ? 'ยังไม่มีบทความของคุณ — หน้าข่าวจะแสดงเนื้อหาตัวอย่างจนกว่าจะเผยแพร่บทความแรก'
                    : `บทความทั้งหมด ${articles.length} ชิ้น (หน้าข่าวแสดงเฉพาะที่เผยแพร่แล้ว)`}
                </div>
                <div onClick={() => setEditing({ title: '', cat: 'อัปเดต', excerpt: '', body: '', published: true })} style={btnAcc}>+ เขียนบทความใหม่</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {articles.map((a) => (
                  <div key={a.id} style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, background: 'rgba(124,131,255,.16)', color: 'var(--acc,#4f46e5)', flexShrink: 0 }}>{a.cat}</span>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: 14.5 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)' }}>{a.created_at}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 8, background: a.published ? 'rgba(34,197,94,.14)' : 'rgba(154,161,173,.12)', color: a.published ? 'var(--ok,#4ade80)' : 'var(--t3,#878e9a)' }}>{a.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}</span>
                    <div onClick={() => setEditing({ ...a, published: !!a.published })} style={btnGhost}>แก้ไข</div>
                    <div onClick={() => deleteArticle(a.id)} style={{ ...btnGhost, color: '#f87171' }}>ลบ</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {editing && (
            <div style={card}>
              <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 17, marginBottom: 18 }}>{editing.id ? 'แก้ไขบทความ' : 'เขียนบทความใหม่'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 12 }}>
                <div>{label('หัวข้อ')}<input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="หัวข้อข่าว/บทความ" style={inputS} /></div>
                <div>{label('หมวด')}<select value={editing.cat} onChange={(e) => setEditing({ ...editing, cat: e.target.value })} style={inputS}>{NEWS_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              {label('สรุปย่อ (โชว์บนการ์ดข่าว)')}
              <input value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="สรุป 1–2 ประโยค" style={{ ...inputS, marginBottom: 12 }} />
              {label('เนื้อหา (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)')}
              <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={10} style={{ ...inputS, height: 'auto', padding: 12, lineHeight: 1.7, resize: 'vertical' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 18px', fontSize: 13.5, cursor: 'pointer', color: 'var(--t2b,#c4c8d2)' }}>
                <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#6d6af5' }} />
                เผยแพร่ทันที (ไม่ติ๊ก = เก็บเป็นฉบับร่าง)
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <div onClick={saveArticle} style={btnAcc}>{editing.id ? 'บันทึกการแก้ไข' : 'บันทึกบทความ'}</div>
                <div onClick={() => setEditing(null)} style={btnGhost}>ยกเลิก</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== IMAGES ===== */}
      {tab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ ...card, padding: '16px 22px', fontSize: 13, color: 'var(--t3,#878e9a)', lineHeight: 1.7 }}>
            รูปที่อัปโหลดตรงนี้แสดงให้<b style={{ color: 'var(--t1,#eef0f5)' }}>ลูกค้าทุกคนเห็นทันที</b> (คลิกช่องหรือลากรูปมาวาง · ระบบย่อ/บีบอัดให้อัตโนมัติ) —
            <b style={{ color: 'var(--t1,#eef0f5)' }}> ปกเกม</b>ใช้บนการ์ดแนวตั้ง (แนะนำรูปตั้ง 2:3) ส่วน<b style={{ color: 'var(--t1,#eef0f5)' }}>แบนเนอร์</b>ใช้บนสไลด์ใหญ่หน้าแรก (แนะนำรูปนอน 16:9) ·
            อีกทางลัด: เปิดหน้าเว็บปกติแล้ว<b style={{ color: 'var(--t1,#eef0f5)' }}>ลากรูปวางบนการ์ดจริงได้เลย</b>ตอนล็อกอินเป็นแอดมิน · ใช้เฉพาะรูปที่มีสิทธิ์ใช้งานนะครับ
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>โลโก้เว็บไซต์</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <SlotBox slotId="logo" w={240} h={80} grad="linear-gradient(140deg,#1b2030,#2a3247)" short="LOGO" caption="โลโก้แถบเมนู" fit="contain" />
              <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: 'var(--t3,#878e9a)', lineHeight: 1.7, paddingTop: 4 }}>
                อัปโหลดแล้วแสดงแทนโลโก้เดิมบน<b style={{ color: 'var(--t1,#eef0f5)' }}>แถบเมนูด้านบนทันที</b> ทั้งเว็บ ·
                แนะนำไฟล์ PNG แนวนอน (พื้นโปร่งใสหรือพื้นขาวก็ได้ ระบบแสดงบนพื้นขาวเสมอเพื่อให้ชัดทั้งโหมดกลางวัน/กลางคืน) ·
                กด <b style={{ color: '#f87171' }}>ลบ</b> เพื่อกลับไปใช้โลโก้เดิม
              </div>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>รูปเกม</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {gamesAll.map((g0) => (
                <div key={g0.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 14px', background: 'var(--s-inset,#161922)', borderRadius: 13, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140, paddingTop: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g0.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{g0.genre}</div>
                  </div>
                  <SlotBox slotId={'img-' + g0.id} w={76} h={114} grad={`linear-gradient(140deg,${g0.c1},${g0.c2})`} short={g0.short} caption="ปกเกม (2:3)" />
                  <SlotBox slotId={'banner-' + g0.id} w={202} h={114} grad={`linear-gradient(140deg,${g0.c1},${g0.c2})`} short={g0.short} caption="แบนเนอร์หน้าแรก (16:9)" />
                </div>
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>รูปข่าว & บทความ</div>
            <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)', marginBottom: 16 }}>{articles.length ? 'บทความของคุณ' : 'ตอนนี้หน้าข่าวแสดงบทความตัวอย่าง — รูปด้านล่างคือของบทความตัวอย่าง'}</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {(articles.length
                ? articles.map((a) => ({ slotId: 'img-a' + a.id, title: a.title }))
                : NEWS.map((n) => ({ slotId: 'img-' + n.id, title: n.title }))
              ).map((it) => (
                <div key={it.slotId} style={{ width: 202 }}>
                  <SlotBox slotId={it.slotId} w={202} h={114} grad="linear-gradient(140deg,#6d6af5,#8b91ff)" short="NEWS" caption="รูปประกอบ (16:9)" />
                  <div style={{ fontSize: 11.5, color: 'var(--t2,#9aa1ad)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SITE MARQUEE ===== */}
      {tab === 'site' && (
        <div style={card}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>ข้อความแถบประกาศวิ่ง (บนสุดของทุกหน้า)</div>
          <p style={{ fontSize: 12.5, color: 'var(--t3,#878e9a)', margin: '0 0 14px' }}>หนึ่งบรรทัด = หนึ่งข้อความ (สูงสุด 12 ข้อความ) · ลบทั้งหมดแล้วบันทึก = กลับไปใช้ข้อความเริ่มต้น</p>
          <textarea value={tickerText} onChange={(e) => setTickerText(e.target.value)} rows={8} style={{ ...inputS, height: 'auto', padding: 12, lineHeight: 1.8, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div onClick={saveTicker} style={btnAcc}>บันทึกแถบประกาศ</div>
          </div>
        </div>
      )}
    </section>
  )
}
