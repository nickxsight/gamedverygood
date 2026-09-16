import type { Vals } from '../vals'

// Crisp stroke icons (emoji rendered muddy and inconsistent across phones).
const icon = (key: string, active: boolean) => {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: active ? 2.1 : 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (key) {
    case 'home': return <svg {...p}><path d="M3.2 11.4 12 3.6l8.8 7.8" /><path d="M5.5 9.9v10.3h4.4v-5.6h4.2v5.6h4.4V9.9" /></svg>
    case 'tools': return <svg {...p}><rect x="3.6" y="3.6" width="7" height="7" rx="2.2" /><rect x="13.4" y="3.6" width="7" height="7" rx="2.2" /><rect x="3.6" y="13.4" width="7" height="7" rx="2.2" /><rect x="13.4" y="13.4" width="7" height="7" rx="2.2" /></svg>
    case 'news': return <svg {...p}><rect x="3.4" y="4.6" width="17.2" height="15" rx="2.6" /><path d="M7.3 9.3h9.4M7.3 12.6h9.4M7.3 15.9h5.4" /></svg>
    case 'history': return <svg {...p}><circle cx="12" cy="8.1" r="3.8" /><path d="M4.6 20.2c1.5-3.5 4.1-5.2 7.4-5.2s5.9 1.7 7.4 5.2" /></svg>
    default: return null
  }
}

export default function BottomNav({ v }: { v: Vals }) {
  return (
    <div data-bottom-nav style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 60, height: 66, background: 'var(--s-navbar,#14161f)', border: '1px solid var(--bd2,rgba(255,255,255,.14))', borderRadius: 22, boxShadow: '0 18px 44px -14px rgba(0,0,0,.55)', alignItems: 'stretch', padding: '0 4px' }}>
      {v.bottomNav.map((b) => b.key === 'topup' ? (
        /* center: raised primary top-up button */
        <div key={b.key} onClick={b.go} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 7, cursor: 'pointer' }}>
          <div style={{ position: 'absolute', top: -24, width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', border: '4px solid var(--s-navbar,#14161f)', boxShadow: '0 10px 26px -6px var(--acc,#4f46e5)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: b.on ? 'var(--acc,#4f46e5)' : 'var(--t2,#9aa1ad)' }}>{b.label}</span>
        </div>
      ) : (
        <div key={b.key} onClick={b.go} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: b.on ? 'var(--acc,#4f46e5)' : 'var(--t3,#878e9a)', transition: 'color .2s' }}>
          {icon(b.key, b.on)}
          <span style={{ fontSize: 10.5, fontWeight: b.on ? 700 : 600 }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}
