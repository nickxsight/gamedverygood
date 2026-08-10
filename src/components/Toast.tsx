import type { Vals } from '../vals'

export default function Toast({ v }: { v: Vals }) {
  if (!v.hasToast) return null
  return (
    <div key={v.toastKey} style={{ position: 'fixed', left: '50%', top: 78, transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 20px', backdropFilter: 'blur(16px) saturate(1.4)', WebkitBackdropFilter: 'blur(16px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.18))', borderRadius: 14, boxShadow: '0 20px 50px -18px rgba(0,0,0,.6)', animation: 'gvgUp .3s ease' }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 15, background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', color: '#fff', flexShrink: 0 }}>{v.toastIcon}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap' }}>{v.toastMsg}</span>
    </div>
  )
}
