import { css } from '../css'
import type { Vals } from '../vals'
import { LogoMark } from './Logo'

export default function Nav({ v }: { v: Vals }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-nav,rgba(11,12,19,.82))', borderBottom: '1px solid var(--bd,rgba(255,255,255,.09))' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 var(--wrap-pad,28px)', height: 70, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div onClick={v.goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', flexShrink: 0 }}>
          <LogoMark shadow />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 16, letterSpacing: '-.2px', color: 'var(--t1,#eef0f5)' }}>gamedvery<span style={{ color: 'var(--acc,#4f46e5)' }}>good</span></div>
            <div style={{ fontSize: 10, letterSpacing: '1.5px', color: 'var(--t3b,#6c727e)', marginTop: 2 }}>GAME HUB</div>
          </div>
        </div>

        <nav data-desk-nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
          {v.nav.map((item) => (
            <div key={item.key} onClick={item.go} style={item.style}>{item.label}</div>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* desktop search */}
        <div data-desk-search style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 200, height: 42, padding: '0 14px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 13 }}>
            <span style={{ color: 'var(--t3b,#6c727e)', fontSize: 15 }}>⌕</span>
            <input value={v.q} onChange={v.setQ} onFocus={v.focusNav} onClick={v.focusNav} onBlur={v.blurSearch} placeholder="ค้นหาเกม..." style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: 'var(--t1,#eef0f5)', fontFamily: "'IBM Plex Sans Thai'" }} />
            {v.hasQuery && <span onClick={v.clearQ} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 15 }}>×</span>}
          </div>
          {v.showSuggestNav && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 330, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 14, boxShadow: '0 24px 60px -18px rgba(0,0,0,.7)', overflow: 'hidden', zIndex: 80 }}>
              <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', color: 'var(--t3,#878e9a)', borderBottom: '1px solid var(--bd-soft,rgba(255,255,255,.06))' }}>{v.suggestHeader}</div>
              {v.suggestList.map((sg) => (
                <div key={sg.key} onMouseDown={sg.pick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', transition: 'background .15s' }}>
                  <div style={css('width:38px;height:38px;border-radius:9px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:12px;color:#fff;' + sg.coverStyle)}>{sg.short}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sg.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{sg.genre}</div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ok,#4ade80)', whiteSpace: 'nowrap' }}>เริ่ม {sg.fromLabel}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={v.toggleTheme} title="สลับโหมดกลางวัน/กลางคืน" style={{ width: 42, height: 42, borderRadius: 13, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.09))', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--t2,#9aa1ad)', flexShrink: 0, transition: 'color .2s,border-color .2s' }}>
            {v.isDay ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.9-1.9M17.5 6.5l1.9-1.9" /></svg>
            )}
          </div>
          {v.showWallet && (
            <div onClick={v.goHistory} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px 0 16px', height: 42, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 13 }}>
              <div style={{ lineHeight: 1.15, textAlign: 'right' }}>
                <div style={{ fontSize: 9.5, color: 'var(--t3b,#6c727e)', letterSpacing: '.3px' }}>{v.walletSub}</div>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 14, color: 'var(--t1,#eef0f5)' }}>{v.walletLabel}</div>
              </div>
              <div onClick={(e) => { e.stopPropagation(); v.goTopup() }} style={{ cursor: 'pointer', height: 32, padding: '0 16px', display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 10, fontWeight: 600, fontSize: 12.5, color: '#fff' }}>เติมเงิน</div>
            </div>
          )}
          <div data-desk-only onClick={v.avatarClick} style={{ width: 42, height: 42, borderRadius: 13, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.09))', display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 13, color: 'var(--acc,#4f46e5)', cursor: 'pointer' }}>
            {v.loggedIn ? v.avatarLabel : <span style={{ fontSize: 18 }}>👤</span>}
          </div>
        </div>
      </div>
    </header>
  )
}
