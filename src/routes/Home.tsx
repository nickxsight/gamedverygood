import { css } from '../css'
import type { Vals } from '../vals'
import ImageSlot from '../components/ImageSlot'
import PosterCard from '../components/PosterCard'

const sectionTitle = (label: string) => (
  <h2 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 25, margin: 0, letterSpacing: '-.6px', display: 'flex', alignItems: 'center', gap: 11 }}>
    <span style={{ width: 5, height: 22, borderRadius: 99, flexShrink: 0, background: 'linear-gradient(var(--acc,#4f46e5),var(--acc2,#7c83ff))', boxShadow: '0 0 14px -2px var(--acc,#4f46e5)' }} />{label}
  </h2>
)

export default function Home({ v }: { v: Vals }) {
  const hs: any = v.heroSlide
  return (
    <section data-screen-label="Homepage">
      {/* ===== HERO + PRICE BOARD ===== */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px var(--wrap-pad,28px) 0' }}>
        <div data-hero-row style={{ display: 'grid', gridTemplateColumns: '1.58fr 1fr', gap: 20, alignItems: 'stretch' }}>
          <div key={hs.key} onMouseMove={v.heroMove} style={css('position:relative;border-radius:26px;overflow:hidden;min-height:452px;display:flex;align-items:flex-end;box-shadow:0 34px 90px -34px rgba(0,0,0,.75);border:1px solid var(--bd2,rgba(255,255,255,.18));animation:gvgUp .5s ease; ' + hs.coverStyle)}>
            <ImageSlot id={`banner-${hs.id}`} placeholder="วางรูปแบนเนอร์เกม" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(420px circle at var(--mx,70%) var(--my,30%),rgba(255,255,255,.16),transparent 62%)' }} />
            <div style={{ position: 'absolute', top: -90, right: -40, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,.16)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -40, bottom: -70, fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 300, lineHeight: .7, color: 'rgba(255,255,255,.1)', pointerEvents: 'none', userSelect: 'none' }}>{hs.short}</div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(7,6,15,.94) 0%,rgba(7,6,15,.62) 46%,rgba(7,6,15,.12) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(7,6,15,.78) 0%,transparent 52%)' }} />
            <div style={{ position: 'relative', zIndex: 2, padding: 46, maxWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 15px', borderRadius: 99, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.24)', fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>🔥 {hs.badge}</span>
              </div>
              <h1 data-hero-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 56, lineHeight: 1.02, letterSpacing: '-2px', margin: '0 0 14px', color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,.4)' }}>{hs.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16, fontSize: 14, color: 'rgba(255,255,255,.9)', fontWeight: 600 }}>
                <span>{hs.genre}</span>
                <span style={{ opacity: .4 }}>•</span>
                <span>{hs.currency}</span>
              </div>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(255,255,255,.86)', margin: '0 0 26px', maxWidth: 520, textWrap: 'pretty' }}>{hs.desc}</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div onClick={hs.topupGo} style={{ cursor: 'pointer', height: 52, padding: '0 30px', display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 14, fontWeight: 700, fontSize: 15.5, color: '#141225', boxShadow: '0 16px 34px -14px rgba(0,0,0,.6)' }}>⚡ เติมเลย</div>
                <div onClick={hs.detail} style={{ cursor: 'pointer', height: 52, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.28)', borderRadius: 14, fontWeight: 600, fontSize: 15, color: '#fff' }}>ดูรายละเอียด</div>
              </div>
            </div>
            <div onClick={v.heroPrev} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', background: 'rgba(8,7,16,.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 22 }}>‹</div>
            <div onClick={v.heroNext} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', background: 'rgba(8,7,16,.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 22 }}>›</div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, zIndex: 3, display: 'flex', gap: 7, justifyContent: 'center' }}>
              {v.heroDots.map((d) => <div key={d.key} onClick={d.go} style={css(d.style)} />)}
            </div>
          </div>

          <div data-price-col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15, flexWrap: 'wrap', gap: 8 }}>
              <h2 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: '-.4px', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 5, height: 20, borderRadius: 99, flexShrink: 0, background: 'linear-gradient(var(--acc,#4f46e5),var(--acc2,#7c83ff))', boxShadow: '0 0 14px -2px var(--acc,#4f46e5)' }} />📈 ราคาเติมวันนี้</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--t3,#878e9a)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'gvgPulse 1.6s infinite' }} />{v.boardIsDeals ? `${v.priceDrops} เกมกำลังลดราคา` : 'ราคาจริง อัปเดตโดยทีมงาน'}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)', margin: '-4px 0 12px' }}>{v.boardIsDeals ? <>เกมที่<span style={{ color: '#4ade80', fontWeight: 600 }}>ลดจากราคาปกติ</span> เติมช่วงนี้คุ้มสุด 🔥</> : 'ราคาเริ่มต้นของเกมยอดนิยม — มีลดราคาเมื่อไหร่ขึ้นที่นี่ทันที'}</div>

            <div style={{ borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.18))', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14),0 18px 40px -22px rgba(0,0,0,.6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr auto auto', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '1px solid var(--bd,rgba(255,255,255,.09))', fontSize: 11, fontWeight: 700, letterSpacing: '.4px', color: 'var(--t3,#878e9a)', textTransform: 'uppercase' }}>
                <div /><div>เกม</div><div style={{ textAlign: 'right' }}>ราคาเริ่มต้น</div><div style={{ textAlign: 'right', paddingLeft: 8 }}>ส่วนลด</div>
              </div>
              {v.priceEmpty && <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3b,#6c727e)', fontSize: 14 }}>วันนี้ยังไม่มีเกมราคาลง</div>}
              {v.boardRows.map((pb: any) => (
                <div key={pb.key} onClick={pb.go} className="gvg-pb-row" style={css(pb.rowStyle)}>
                  <div style={css('position:relative;width:38px;height:38px;border-radius:10px;overflow:hidden;justify-self:center;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:11px;color:#fff;border:2.5px solid ' + pb.color + ';box-shadow:0 0 10px -2px ' + pb.color + '; background:' + pb.grad + ';')}>
                    <ImageSlot id={pb.slotId} placeholder="รูป" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{pb.short}</span>
                  </div>
                  <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pb.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pb.currency}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 17, color: 'var(--t1,#eef0f5)' }}>{pb.priceLabel}</span>
                    <div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)', textDecoration: 'line-through' }}>{pb.prevLabel}</div>
                  </div>
                  <div style={{ textAlign: 'right', paddingLeft: 8 }}>
                    <span style={css('display:inline-flex;align-items:center;justify-content:flex-end;padding:5px 11px;border-radius:9px;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:13px;white-space:nowrap;color:' + pb.color + ';background:' + pb.chipBg + ';border:1px solid ' + pb.chipBd + ';')}>{pb.pctLabel}</span>
                  </div>
                </div>
              ))}
            </div>
            {v.boardMultetPage && (
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 16 }}>
                {v.boardDotsEls.map((bd) => <div key={bd.key} onClick={bd.go} style={css(bd.style)} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '30px var(--wrap-pad,28px) 8px' }}>
        <div style={{ position: 'relative', maxWidth: 660, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 58, padding: '0 8px 0 20px', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.18))', borderRadius: 16, boxShadow: '0 16px 40px -20px rgba(0,0,0,.5)' }}>
            <span style={{ color: 'var(--t3b,#6c727e)', fontSize: 20 }}>⌕</span>
            <input value={v.q} onChange={v.setQ} onFocus={v.focusHero} onClick={v.focusHero} onBlur={v.blurSearch} placeholder="ค้นหาเกมที่อยากเติม เช่น Free Fire, Valorant, RoV..." style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, color: 'var(--t1,#eef0f5)', fontFamily: "'IBM Plex Sans Thai'" }} />
            <div onClick={v.goCatalog} style={{ cursor: 'pointer', height: 42, padding: '0 22px', display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 11, fontWeight: 600, fontSize: 14, color: '#fff' }}>ค้นหา</div>
          </div>
          {v.showSuggestHero && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.18))', borderRadius: 16, boxShadow: '0 24px 60px -18px rgba(0,0,0,.7)', overflow: 'hidden', zIndex: 80 }}>
              <div style={{ padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.5px', color: 'var(--t3,#878e9a)', borderBottom: '1px solid var(--bd-soft,rgba(255,255,255,.06))' }}>{v.suggestHeader}</div>
              {v.suggestList.map((sg) => (
                <div key={sg.key} onMouseDown={sg.pick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', transition: 'background .15s' }}>
                  <div style={css('overflow:hidden;width:40px;height:40px;border-radius:9px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:12px;color:#fff; ' + sg.coverStyle)}>
                    {sg.imgSrc ? <img src={sg.imgSrc} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : sg.short}
                  </div>
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
      </div>

      {/* ===== SEARCH RESULTS ===== */}
      {v.hasQuery && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '22px var(--wrap-pad,28px) 0' }}>
          <h2 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 25, margin: '0 0 18px', letterSpacing: '-.6px' }}>ผลการค้นหา "{v.q}" · {v.searchCount} เกม</h2>
          {v.homeNoResult && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--t3b,#6c727e)', fontSize: 15, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', borderRadius: 18, border: '1px solid var(--bd,rgba(255,255,255,.09))' }}>ไม่พบเกม "{v.q}" — ลองค้นหาด้วยชื่ออื่น</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 18 }}>
            {v.searchPosters.map((p: any) => <PosterCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* ===== BROWSE ===== */}
      {v.browseMode && (
        <>
          {v.hasRecent && (
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: '34px var(--wrap-pad,28px) 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>{sectionTitle('↻ เติมล่าสุดของคุณ')}</div>
              <div className="gvg-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 4px 12px' }}>
                {v.recentOrders.map((r: any) => (
                  <div key={r.key} onClick={r.reorder} style={{ cursor: 'pointer', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, width: 242, padding: 14, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 15, transition: 'border-color .2s' }}>
                    <div style={css('width:46px;height:46px;border-radius:12px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:13px;color:#fff; ' + r.coverStyle)}>{r.short}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{r.sub}</div>
                    </div>
                    <span style={{ fontSize: 17, color: 'var(--acc,#4f46e5)' }}>↻</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px var(--wrap-pad,28px) 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
              {sectionTitle('เกมทั้งหมด')}
              <div onClick={v.goCatalog} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--t2,#9aa1ad)' }}>ดูทั้งหมด →</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(158px,1fr))', gap: 18 }}>
              {v.allPosters.map((p: any) => <PosterCard key={p.id} p={p} />)}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
