import type { Vals } from '../vals'

export default function PromoBar({ v }: { v: Vals }) {
  const row = (aria: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, fontSize: 12.5, fontWeight: 500 }} aria-hidden={aria || undefined}>
      {v.promoTicker.map((pt, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{pt.text}</span>
          <span style={{ opacity: .5, padding: '0 22px' }}>◆</span>
        </span>
      ))}
    </div>
  )
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(90deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', color: '#fff', padding: '9px 0' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'gvgMarquee 32s linear infinite' }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
