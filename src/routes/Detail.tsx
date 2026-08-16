import { css } from '../css'
import type { Vals } from '../vals'
import ImageSlot from '../components/ImageSlot'

export default function Detail({ v }: { v: Vals }) {
  const g: any = v.g
  return (
    <section data-screen-label="Game Detail" style={{ maxWidth: 1240, margin: '0 auto', padding: '28px var(--wrap-pad,28px) 0' }}>
      <div onClick={v.goHome} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--t3,#878e9a)', marginBottom: 18 }}>← กลับหน้าแรก</div>
      <div style={css('position:relative;border-radius:24px;overflow:hidden;min-height:280px;display:flex;align-items:flex-end;padding:36px;margin-bottom:32px; ' + g.coverStyle)}>
        <ImageSlot id={g.slotId} placeholder="วางรูปแบนเนอร์เกม" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(0,0,0,.85) 25%,transparent 90%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={css('width:96px;height:96px;border-radius:22px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:28px;color:#fff;box-shadow:0 16px 40px -12px rgba(0,0,0,.4); ' + g.coverStyle)}>{g.short}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ padding: '4px 11px', background: 'rgba(255,255,255,.18)', borderRadius: 8, fontSize: 12, color: '#fff' }}>{g.genre}</span>
              </div>
            <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 44, margin: '0 0 8px', letterSpacing: '-1.5px', color: '#fff' }}>{g.name}</h1>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.82)', margin: 0, maxWidth: 540, lineHeight: 1.6 }}>{g.desc}</p>
          </div>
        </div>
      </div>

      <div data-resp="topup" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 22, margin: '0 0 16px' }}>แพ็กเกจเติม {g.currency}</h2>
          <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 36 }}>
            {v.pkgs.map((p: any) => (
              <div key={p.id} onClick={p.pickGo} style={{ position: 'relative', cursor: 'pointer', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 16, padding: 18, textAlign: 'center', transition: 'border-color .2s,transform .2s' }}>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 22 }}>{p.amount}</div>
                <div style={{ fontSize: 11, color: 'var(--good,#16a34a)', fontWeight: 500, height: 14 }}>{p.bonusLabel}</div>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 16, marginTop: 10, color: 'var(--acc,#4f46e5)' }}>฿{p.price}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 22, margin: '0 0 16px' }}>เกมที่เกี่ยวข้อง</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14 }}>
            {v.related.map((game: any) => (
              <div key={game.id} onClick={game.open} style={{ cursor: 'pointer' }}>
                <div className="gvg-poster" style={css('position:relative;aspect-ratio:2/3;border-radius:14px;overflow:hidden;border:1px solid var(--bd2,rgba(255,255,255,.18));box-shadow:0 14px 30px -18px rgba(0,0,0,.6);--pneon:' + game.c1 + '; ' + game.coverStyle)}>
                  <div style={{ position: 'absolute', top: '-25%', right: '-18%', width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,.22)', filter: 'blur(24px)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 32, color: 'rgba(255,255,255,.94)', textShadow: '0 6px 20px rgba(0,0,0,.4)', pointerEvents: 'none', letterSpacing: '-1px' }}>{game.short}</div>
                  <ImageSlot id={game.slotId} placeholder="วางรูปเกม" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', zIndex: 1 }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%', background: 'linear-gradient(0deg,rgba(6,5,14,.92),transparent)', pointerEvents: 'none', zIndex: 2 }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, padding: '10px 11px', fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 13.5, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 2px 8px rgba(0,0,0,.9),0 0 20px rgba(0,0,0,.6)' }}>{game.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'sticky', top: 88, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 20, padding: 24, boxShadow: '0 16px 44px -24px rgba(0,0,0,.18)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginBottom: 6 }}>เริ่มต้นเพียง</div>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 34, marginBottom: 4 }}>฿{v.gFrom}</div>
          <div style={{ fontSize: 13, color: 'var(--t3,#878e9a)', marginBottom: 20 }}>เติมอัตโนมัติ · ปลอดภัย 100%</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ color: 'var(--good,#16a34a)', fontWeight: 700 }}>✓</span> เติมเข้าทันทีภายใน 5 วินาที</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ color: 'var(--good,#16a34a)', fontWeight: 700 }}>✓</span> รองรับทุกช่องทางชำระเงิน</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ color: 'var(--good,#16a34a)', fontWeight: 700 }}>✓</span> ทีมงานซัพพอร์ต 24 ชม.</div>
          </div>
          <div onClick={v.goTopup} style={{ cursor: 'pointer', height: 50, display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 13, fontWeight: 600, fontSize: 15, color: '#fff', boxShadow: '0 12px 30px -14px var(--acc,#4f46e5)' }}>เติมเลย →</div>
        </div>
      </div>
    </section>
  )
}
