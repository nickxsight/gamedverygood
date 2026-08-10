import type { Vals } from '../vals'

export default function Footer({ v }: { v: Vals }) {
  return (
    <footer style={{ position: 'relative', zIndex: 1, marginTop: 80, borderTop: '1px solid var(--bd,rgba(255,255,255,.09))', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-foot,#0f1117)' }}>
      <div data-resp="foot" style={{ maxWidth: 1240, margin: '0 auto', padding: '48px var(--wrap-pad,28px) 36px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 36 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: 'linear-gradient(150deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', borderRadius: 10 }}>
              <svg width="21" height="21" viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10 10h8c2.8 0 5 2.2 5 5 0 2-1.6 3.7-3.7 3.7-1.1 0-2.2-.5-2.9-1.4l-.7-.9h-3.4l-.7.9c-.7.9-1.8 1.4-2.9 1.4C6.6 18.7 5 17 5 15c0-2.8 2.2-5 5-5Z" /><path d="M8.6 13.6v2.8M7.2 15h2.8" /><circle cx="17.6" cy="14.2" r=".55" fill="#fff" stroke="none" /><circle cx="19.2" cy="15.9" r=".55" fill="#fff" stroke="none" /></svg>
            </div>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 15 }}>gamedvery<span style={{ color: 'var(--acc,#4f46e5)' }}>good</span></div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--t3b,#6c727e)', lineHeight: 1.6, maxWidth: 280, margin: '0 0 14px' }}>แพลตฟอร์มเติมเกม ข่าวสาร และ Tools ครบวงจร — เร็ว ปลอดภัย เชื่อถือได้</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '5px 10px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 8, color: 'var(--t3,#878e9a)' }}>🔒 SSL Secured</span>
            <span style={{ fontSize: 11, padding: '5px 10px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 8, color: 'var(--t3,#878e9a)' }}>✓ ปลอดภัย 100%</span>
          </div>
        </div>
        {v.footCols.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <div key={l} style={{ fontSize: 13, color: 'var(--t3,#878e9a)', cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--bd,rgba(255,255,255,.09))', padding: '18px var(--wrap-pad,28px)', textAlign: 'center', fontSize: 12, color: '#565b66' }}>© 2026 gamedverygood.com · Game Hub · All rights reserved</div>
    </footer>
  )
}
