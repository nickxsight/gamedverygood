import { css } from '../css'
import type { Vals } from '../vals'
import ImageSlot from '../components/ImageSlot'

export default function News({ v }: { v: Vals }) {
  const f: any = v.feature
  return (
    <section data-screen-label="News" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>NEWS FEED</div>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-1.2px' }}>ข่าวเกม & บทความ</h1>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {v.newsFilters.map((flt, i) => <div key={i} onClick={flt.pick} style={css(flt.style)}>{flt.label}</div>)}
      </div>
      <div onClick={f.open} style={css('cursor:pointer;position:relative;border-radius:22px;overflow:hidden;margin-bottom:28px;min-height:320px;display:grid;place-items:end start;padding:40px; ' + f.coverStyle)}>
        <ImageSlot id={f.slotId} placeholder="วางรูปข่าวเด่น" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(0,0,0,.82) 20%,transparent 85%)' }} />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <span style={{ display: 'inline-block', padding: '5px 12px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'var(--acc,#4f46e5)', marginBottom: 14 }}>{f.cat} · FEATURED</span>
          <h2 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 32, lineHeight: 1.2, margin: '0 0 12px', color: '#fff', textWrap: 'pretty' }}>{f.title}</h2>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.82)', margin: '0 0 14px', lineHeight: 1.6 }}>{f.excerpt}</p>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)' }}>{f.time}</div>
        </div>
      </div>
      <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {v.news.map((n: any) => (
          <div key={n.id} onClick={n.open} style={{ cursor: 'pointer', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, overflow: 'hidden', transition: 'box-shadow .25s' }}>
            <div style={css('position:relative;height:160px;overflow:hidden; ' + n.coverStyle)}>
              <ImageSlot id={n.slotId} placeholder="วางรูปข่าว" style={{ display: 'block', width: '100%', height: '100%' }} />
              <span style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 2, padding: '4px 10px', background: 'rgba(8,9,14,.6)', backdropFilter: 'blur(6px)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 7, fontSize: 11, fontWeight: 600, color: '#a9b0ff' }}>{n.cat}</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.4, marginBottom: 9, textWrap: 'pretty' }}>{n.title}</div>
              <div style={{ fontSize: 13, color: 'var(--t3,#878e9a)', lineHeight: 1.5, marginBottom: 12 }}>{n.excerpt}</div>
              <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)' }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
