import { css } from '../css'
import type { Vals } from '../vals'

export default function Tools({ v }: { v: Vals }) {
  return (
    <section data-screen-label="Tools" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>TOOLKIT</div>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: '0 0 10px', letterSpacing: '-1.2px' }}>Tools ช่วยเล่นเกม</h1>
        <p style={{ fontSize: 15.5, color: 'var(--t2,#9aa1ad)', margin: 0, maxWidth: 560 }}>ชุดเครื่องมือคำนวณ ปรับแต่ง และวิเคราะห์เกม สำหรับสายโปร — ใช้งานบนเว็บได้ทันที</p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {v.toolFilters.map((f, i) => <div key={i} onClick={f.pick} style={css(f.style)}>{f.label}</div>)}
      </div>
      <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {v.tools.map((t: any) => (
          <div key={t.id} className="gvg-tilt" style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={css('width:50px;height:50px;border-radius:14px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:15px;color:#fff; ' + t.iconStyle)}>{t.code}</div>
              <span style={css(t.badgeStyle)}>{t.status}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 7 }}>{t.name}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--t3,#878e9a)', marginBottom: 18, minHeight: 40 }}>{t.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 9px', borderRadius: 7, background: 'var(--s-input,#181b24)', border: '1px solid var(--bd-soft,rgba(255,255,255,.06))', color: 'var(--t3,#878e9a)' }}>{t.game}</span>
              <div onClick={t.toggle} style={css(t.btnStyle)}>{t.btnLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
