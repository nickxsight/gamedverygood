import { css } from '../css'
import type { Vals } from '../vals'
import PosterCard from '../components/PosterCard'

export default function Catalog({ v }: { v: Vals }) {
  return (
    <section data-screen-label="Catalog" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>GAME CATALOG</div>
        <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: '0 0 6px', letterSpacing: '-1.2px' }}>เลือกเกมทั้งหมด</h1>
        <p style={{ fontSize: 15, color: 'var(--t2,#9aa1ad)', margin: 0 }}>ค้นหาและกรองเกมกว่า {v.catalogCount} รายการ — เจอเกมที่ต้องการเติมได้ใน 3 วินาที</p>
      </div>

      {/* catalog search */}
      <div style={{ position: 'relative', maxWidth: 520, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 16px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 14 }}>
          <span style={{ color: 'var(--t3b,#6c727e)', fontSize: 17 }}>⌕</span>
          <input value={v.q} onChange={v.setQ} onFocus={v.focusCatalog} onClick={v.focusCatalog} onBlur={v.blurSearch} placeholder="พิมพ์ชื่อเกม เช่น ฟรีฟาย, valorant, ml..." style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontSize: 14.5, color: 'var(--t1,#eef0f5)', fontFamily: "'IBM Plex Sans Thai'" }} />
          {v.hasQuery && <span onClick={v.clearQ} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 17 }}>×</span>}
        </div>
        {v.showSuggestCatalog && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 14, boxShadow: '0 24px 60px -18px rgba(0,0,0,.7)', overflow: 'hidden', zIndex: 80 }}>
            <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', color: 'var(--t3,#878e9a)', borderBottom: '1px solid var(--bd-soft,rgba(255,255,255,.06))' }}>{v.suggestHeader}</div>
            {v.suggestList.map((sg) => (
              <div key={sg.key} onMouseDown={sg.pick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', transition: 'background .15s' }}>
                <div style={css('width:40px;height:40px;border-radius:9px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:12px;color:#fff; ' + sg.coverStyle)}>{sg.short}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sg.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3,#878e9a)' }}>{sg.genre}</div>
                </div>
                <span style={{ fontSize: 16, color: 'var(--acc,#4f46e5)' }}>›</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* category tabs */}
      <div className="gvg-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
        {v.categoryTabs.map((c, i) => <div key={i} onClick={c.pick} style={css(c.style)}>{c.label}</div>)}
      </div>

      {/* platform + sort row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--bd-soft,rgba(255,255,255,.07))' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {v.platformChips.map((p, i) => <div key={i} onClick={p.pick} style={css(p.style)}>{p.label}</div>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--t3,#878e9a)' }}>เรียงโดย</span>
          {v.sortPills.map((p, i) => <div key={i} onClick={p.pick} style={css(p.style)}>{p.label}</div>)}
        </div>
      </div>

      {v.catalogNoResult && (
        <div style={{ padding: 56, textAlign: 'center', color: 'var(--t3b,#6c727e)', fontSize: 15, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', borderRadius: 18, border: '1px solid var(--bd,rgba(255,255,255,.09))' }}>😕 ไม่พบเกมที่ตรงกับเงื่อนไข — ลองล้างตัวกรองหรือค้นหาคำอื่น</div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 18 }}>
        {v.catalogGames.map((p: any) => <PosterCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}
