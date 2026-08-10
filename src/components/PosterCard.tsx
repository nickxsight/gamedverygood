import { css } from '../css'
import ImageSlot from './ImageSlot'

// Movie-poster style game card (2:3), no price/rating — used on Home (search &
// all-games) and the Catalog grid. `p` is a poster view-model from computeVals.
export default function PosterCard({ p }: { p: any }) {
  return (
    <div onClick={p.open} style={{ cursor: 'pointer' }}>
      <div className="gvg-poster" style={css(p.posterStyle)}>
        <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.22)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, color: 'rgba(255,255,255,.94)', textShadow: '0 6px 20px rgba(0,0,0,.4)', pointerEvents: 'none', letterSpacing: '-1px' }}>{p.short}</div>
        <ImageSlot id={p.slotId} placeholder="วางรูปเกม" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', background: 'linear-gradient(0deg,rgba(6,5,14,.97) 6%,rgba(6,5,14,.62) 46%,transparent)', pointerEvents: 'none', zIndex: 1 }} />
        <div onClick={p.toggleFav} style={css(p.favBtnStyle)}><span style={{ color: p.favColor, lineHeight: 1 }}>{p.favIcon}</span></div>
        {p.newBadge && (
          <div style={{ position: 'absolute', bottom: 56, left: 11, zIndex: 3, padding: '3px 9px', background: 'var(--ok,#4ade80)', borderRadius: 7, fontSize: 10, fontWeight: 700, color: '#07080d' }}>NEW</div>
        )}
        <div className="gvg-cta" onClick={p.topup} style={{ position: 'absolute', left: 11, right: 11, bottom: 54, zIndex: 4, opacity: 0, transform: 'translateY(8px)', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#141225', boxShadow: '0 12px 26px -10px rgba(0,0,0,.6)', cursor: 'pointer' }}>⚡ เติมเลย</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '12px 13px' }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 15, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 2px 8px rgba(0,0,0,.9),0 0 20px rgba(0,0,0,.6)' }}>{p.name}</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.85)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 1px 6px rgba(0,0,0,.9)' }}>{p.genre}</div>
        </div>
      </div>
    </div>
  )
}
