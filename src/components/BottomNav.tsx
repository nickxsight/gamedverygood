import type { Vals } from '../vals'

export default function BottomNav({ v }: { v: Vals }) {
  return (
    <div data-bottom-nav style={{ position: 'fixed', left: 14, right: 14, bottom: 14, zIndex: 60, height: 62, backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)', background: 'var(--s-nav,rgba(11,12,19,.92))', border: '1px solid var(--bd2,rgba(255,255,255,.18))', borderRadius: 22, boxShadow: '0 18px 44px -18px rgba(0,0,0,.6)', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px' }}>
      {v.bottomNav.map((b) => (
        <div key={b.key} onClick={b.go} style={b.style}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>{b.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600 }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}
