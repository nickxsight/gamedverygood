import type { Vals } from '../vals'

const row = (label: string, value: string | number, color: string) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--s-inset,#161922)', borderRadius: 12 }}>
    <span style={{ fontSize: 13.5, color: 'var(--t2,#9aa1ad)' }}>{label}</span>
    <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 20, color }}>{value}</span>
  </div>
)

const field = (label: string, value: string, onChange: (e: any) => void) => (
  <div>
    <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>{label}</label>
    <input value={value} onChange={onChange} style={{ width: '100%', height: 46, padding: '0 14px', background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, color: 'var(--t1,#eef0f5)', fontSize: 15, fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", outline: 'none' }} />
  </div>
)

export default function ToolModal({ v }: { v: Vals }) {
  const d = v.toolModalData
  if (!d) return null
  return (
    <div onClick={v.closeTool} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,5,9,.7)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={v.noop} style={{ width: '100%', maxWidth: 440, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 22, padding: 28, boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 19 }}>{d.title}</div>
          <div onClick={v.closeTool} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 22 }}>×</div>
        </div>
        {v.isSensTool && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {field('ค่าความไว (Sens)', v.tSens, v.setSens)}
              {field('DPI', v.tDpi, v.setDpi)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {row('eDPI', d.edpi, 'var(--acc,#4f46e5)')}
              {row('ระยะ cm/360°', `${d.cm360} cm`, 'var(--t1,#eef0f5)')}
              {row('Valorant Sens (@800 DPI)', d.valoConv, 'var(--ok,#4ade80)')}
            </div>
          </div>
        )}
        {v.isGachaTool && (
          <div>
            {field('งบประมาณ (฿)', v.tBudget, v.setBudget)}
            <div style={{ height: 18 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {row('จำนวนสุ่มได้', `${d.pulls} ครั้ง`, 'var(--acc,#4f46e5)')}
              {row('โอกาสได้ 5★ อย่างน้อย 1', `${d.pPct}%`, 'var(--ok,#4ade80)')}
              {row('5★ ที่คาดว่าจะได้', `~${d.expected}`, 'var(--t1,#eef0f5)')}
              <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)', padding: '0 4px' }}>* อ้างอิงเรต 0.6% เพดานการันตี 90 ครั้ง · {d.guaranteed}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
