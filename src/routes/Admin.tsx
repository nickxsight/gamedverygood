import { useEffect, useState } from 'react'
import type { Vals } from '../vals'
import { useStore } from '../store'
import { GAMES, PKGS } from '../data'
import { css } from '../css'

// Admin backoffice: overview, per-game package/price editor, news CMS.
// Server-side authorization is the real gate (ADMIN_EMAILS allowlist); this
// component just mirrors it in the UI.

const card: React.CSSProperties = { backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22 }
const inputS: React.CSSProperties = { height: 42, padding: '0 12px', background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 10, color: 'var(--t1,#eef0f5)', fontSize: 13.5, fontFamily: "'IBM Plex Sans Thai'", outline: 'none', width: '100%' }
const btnAcc: React.CSSProperties = { cursor: 'pointer', height: 42, padding: '0 20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--acc,#4f46e5)', borderRadius: 11, fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }
const btnGhost: React.CSSProperties = { cursor: 'pointer', height: 42, padding: '0 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--t2b,#c4c8d2)', whiteSpace: 'nowrap' }

async function call(path: string, method = 'GET', body?: unknown) {
  const resp = await fetch(path, body === undefined
    ? { method }
    : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await resp.json().catch(() => ({}))
  return { ok: resp.ok, data }
}

type PkgRow = { amount: string; price: string; bonus: string; tag: string }
const NEWS_CATS = ['อัปเดต', 'อีสปอร์ต', 'รีวิว', 'โปรโมชั่น', 'ไกด์']

export default function Admin({ v }: { v: Vals }) {
  const showToast = useStore((s) => s.showToast)
  const loadContent = useStore((s) => s.loadContent)
  const applyPackages = useStore((s) => s.applyPackages)
  const pkgMap = useStore((s) => s.pkgMap)

  const [tab, setTab] = useState<'overview' | 'pkgs' | 'news'>('overview')
  const [overview, setOverview] = useState<any>(null)

  // package editor state
  const [gid, setGid] = useState(GAMES[0].id)
  const [rows, setRows] = useState<PkgRow[]>([])
  const [pkgBusy, setPkgBusy] = useState(false)

  // news editor state
  const [articles, setArticles] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null) // null=closed, {}=new, row=edit

  const custom = !!(pkgMap[gid] && pkgMap[gid].length)
  useEffect(() => {
    const src = pkgMap[gid] && pkgMap[gid].length ? pkgMap[gid] : PKGS
    setRows(src.map((p) => ({ amount: p.amount, price: String(p.price), bonus: String(p.bonus), tag: p.tag })))
  }, [gid, pkgMap])

  useEffect(() => {
    if (!v.isAdmin) return
    call('/api/admin/overview').then((r) => { if (r.ok) setOverview(r.data) })
    call('/api/admin/articles').then((r) => { if (r.ok) setArticles(r.data.articles || []) })
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

  const game = GAMES.find((x) => x.id === gid)!

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

  const saveArticle = async () => {
    const isNew = !editing.id
    const r = await call(isNew ? '/api/admin/articles' : '/api/admin/articles/' + editing.id, isNew ? 'POST' : 'PUT', {
      title: editing.title, cat: editing.cat || 'อัปเดต', excerpt: editing.excerpt, body: editing.body, published: !!editing.published,
    })
    if (r.ok) {
      setEditing(null)
      showToast(isNew ? 'เผยแพร่บทความแล้ว' : 'บันทึกบทความแล้ว', '✓')
      call('/api/admin/articles').then((x) => { if (x.ok) setArticles(x.data.articles || []) })
      loadContent()
    } else showToast(r.data.message || 'บันทึกไม่สำเร็จ', '⚠️')
  }
  const deleteArticle = async (id: number) => {
    if (!window.confirm('ลบบทความนี้ถาวร?')) return
    const r = await call('/api/admin/articles/' + id, 'DELETE')
    if (r.ok) {
      setArticles((a) => a.filter((x) => x.id !== id))
      showToast('ลบบทความแล้ว', '🗑️')
      loadContent()
    }
  }

  const tabBtn = (key: typeof tab, label: string) => (
    <div onClick={() => setTab(key)} style={{ cursor: 'pointer', padding: '9px 18px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, transition: 'all .2s', background: tab === key ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)', color: tab === key ? '#fff' : 'var(--t2,#9aa1ad)', border: `1.5px solid ${tab === key ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'}` }}>{label}</div>
  )

  return (
    <section data-screen-label="Admin" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>BACKOFFICE</div>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-1.2px' }}>หลังบ้านผู้ดูแล</h1>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 26, flexWrap: 'wrap' }}>
        {tabBtn('overview', '📊 ภาพรวม')}
        {tabBtn('pkgs', '💰 แพ็กเกจ & ราคา')}
        {tabBtn('news', '📰 ข่าว & บทความ')}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === 'overview' && (
        <div>
          <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 26 }}>
            {[
              { label: 'สมาชิกทั้งหมด', value: overview ? overview.users.toLocaleString() : '…' },
              { label: 'ออเดอร์สำเร็จ', value: overview ? overview.orders.toLocaleString() : '…' },
              { label: 'ยอดขายรวม', value: overview ? '฿' + overview.revenue.toLocaleString() : '…' },
            ].map((a, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginBottom: 8 }}>{a.label}</div>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 26, color: 'var(--acc,#4f46e5)' }}>{a.value}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>ออเดอร์ล่าสุด</div>
            {(!overview || overview.latest.length === 0) && <div style={{ color: 'var(--t3b,#6c727e)', fontSize: 13.5, padding: '14px 0' }}>ยังไม่มีออเดอร์</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(overview?.latest || []).map((o: any, i: number) => {
                const og = GAMES.find((x) => x.id === o.gid)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--s-inset,#161922)', borderRadius: 11, fontSize: 13, flexWrap: 'wrap' }}>
                    <div style={css('width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-family:\'Space Grotesk\';font-weight:700;font-size:10px;color:#fff;background:linear-gradient(140deg,' + (og?.c1 || '#666') + ',' + (og?.c2 || '#444') + ');')}>{og?.short || '?'}</div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 600 }}>{og?.name || o.gid} · {o.amount || o.pkg}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{o.buyer} · {o.ref}</div>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700 }}>฿{o.price}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== PACKAGES & PRICES ===== */}
      {tab === 'pkgs' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>เลือกเกม</label>
              <select value={gid} onChange={(e) => setGid(e.target.value)} style={{ ...inputS, width: 260 }}>
                {GAMES.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.currency})</option>)}
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
                <div>
                  <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>หัวข้อ</label>
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="หัวข้อข่าว/บทความ" style={inputS} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>หมวด</label>
                  <select value={editing.cat} onChange={(e) => setEditing({ ...editing, cat: e.target.value })} style={inputS}>
                    {NEWS_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>สรุปย่อ (โชว์บนการ์ดข่าว)</label>
              <input value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} placeholder="สรุป 1–2 ประโยค" style={{ ...inputS, marginBottom: 12 }} />
              <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>เนื้อหา (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)</label>
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
    </section>
  )
}
