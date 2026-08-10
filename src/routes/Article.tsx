import { css } from '../css'
import type { Vals } from '../vals'
import ImageSlot from '../components/ImageSlot'

export default function Article({ v }: { v: Vals }) {
  const a: any = v.article
  return (
    <section data-screen-label="Article" style={{ maxWidth: 860, margin: '0 auto', padding: '32px var(--wrap-pad,28px) 0' }}>
      <div onClick={v.goNews} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--t3,#878e9a)', marginBottom: 20 }}>← กลับหน้าข่าว</div>
      <span style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(124,131,255,.16)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--acc,#4f46e5)', marginBottom: 16 }}>{a.cat}</span>
      <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 36, lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-1px', textWrap: 'pretty' }}>{a.title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t3b,#6c727e)', marginBottom: 24 }}>
        <span style={css('width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:11px;color:#fff; ' + a.coverStyle)}>G</span>
        ทีมข่าว GVG · {a.time}
      </div>
      <div style={css('position:relative;border-radius:20px;overflow:hidden;height:340px;margin-bottom:28px; ' + a.coverStyle)}>
        <ImageSlot id={a.slotId} placeholder="วางรูปประกอบบทความ" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--t2b,#c4c8d2)' }}>
        {a.body.map((para: string, i: number) => <p key={i} style={{ margin: '0 0 20px', textWrap: 'pretty' }}>{para}</p>)}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '28px 0', padding: '18px 0', borderTop: '1px solid var(--bd,rgba(255,255,255,.09))', borderBottom: '1px solid var(--bd,rgba(255,255,255,.09))' }}>
        <span style={{ fontSize: 13, color: 'var(--t3b,#6c727e)' }}>แชร์บทความ:</span>
        {v.shareBtns.map((b) => <span key={b} style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 500, padding: '5px 12px', borderRadius: 8, background: 'var(--s-inset,#161922)', border: '1px solid var(--bd,rgba(255,255,255,.1))', color: 'var(--t2b,#c4c8d2)' }}>{b}</span>)}
      </div>
      <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 20, marginBottom: 16 }}>บทความที่เกี่ยวข้อง</div>
      <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        {a.more.map((m: any) => (
          <div key={m.id} onClick={m.open} style={{ cursor: 'pointer', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow .25s' }}>
            <div style={css('position:relative;height:120px;overflow:hidden; ' + m.coverStyle)}>
              <ImageSlot id={m.slotId} placeholder="รูป" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.4, textWrap: 'pretty' }}>{m.title}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
