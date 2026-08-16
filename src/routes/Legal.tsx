import type { Vals } from '../vals'
import { useStore } from '../store'
import { LEGAL_DOCS } from '../legal'

export default function Legal({ v }: { v: Vals }) {
  const legalDoc = useStore((s) => s.legalDoc)
  const set = useStore((s) => s.set)
  const doc = LEGAL_DOCS.find((d) => d.key === legalDoc) || LEGAL_DOCS[0]
  return (
    <section data-screen-label="Legal" style={{ maxWidth: 860, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div onClick={v.goHome} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--t3,#878e9a)', marginBottom: 18 }}>← กลับหน้าแรก</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 26, flexWrap: 'wrap' }}>
        {LEGAL_DOCS.map((d) => (
          <div key={d.key} onClick={() => set({ legalDoc: d.key })} style={{ cursor: 'pointer', padding: '9px 18px', borderRadius: 11, fontSize: 13.5, fontWeight: 600, transition: 'all .2s', background: doc.key === d.key ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)', color: doc.key === d.key ? '#fff' : 'var(--t2,#9aa1ad)', border: `1.5px solid ${doc.key === d.key ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'}` }}>{d.title}</div>
        ))}
      </div>
      <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 20, padding: '32px 34px' }}>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 30, margin: '0 0 6px', letterSpacing: '-.8px' }}>{doc.title}</h1>
        <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginBottom: 26 }}>gamedverygood.com · อัปเดตล่าสุด: {doc.updated}</div>
        {doc.sections.map((sec) => (
          <div key={sec.h} style={{ marginBottom: 22 }}>
            <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 8 }}>{sec.h}</div>
            {sec.ps.map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--t2b,#c4c8d2)', margin: '0 0 10px', textWrap: 'pretty' }}>{p}</p>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 28, padding: '12px 16px', background: 'var(--s-inset,#161922)', borderRadius: 12, fontSize: 12, color: 'var(--t3b,#6c727e)', lineHeight: 1.7 }}>
          หมายเหตุ: เอกสารฉบับนี้จัดทำเป็นแม่แบบเบื้องต้นสำหรับธุรกิจเติมเกม ควรได้รับการตรวจทานโดยที่ปรึกษากฎหมายก่อนใช้งานเชิงพาณิชย์
        </div>
      </div>
    </section>
  )
}
