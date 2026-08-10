import { useEffect, useRef } from 'react'
import { css } from '../css'
import type { Vals } from '../vals'

const BotIcon = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 8V4M9 4h6" /><circle cx="9" cy="13" r="1" fill="#fff" stroke="none" /><circle cx="15" cy="13" r="1" fill="#fff" stroke="none" /></svg>
)

export default function Chat({ v }: { v: Vals }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (v.chatOpen && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [v.chatOpen, v.chatMessages, v.chatTyping])

  return (
    <>
      {/* launcher */}
      {v.chatClosed && (
        <div data-help onClick={v.toggleChat} style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 65, display: 'flex', alignItems: 'center', gap: 11, height: 54, padding: '0 20px 0 13px', background: 'var(--acc,#4f46e5)', borderRadius: 99, fontWeight: 600, fontSize: 14, color: '#fff', boxShadow: '0 16px 38px -10px var(--acc,#4f46e5)', cursor: 'pointer', animation: 'gvgUp .3s ease' }}>
          <div style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 8V4M9 4h6" /><circle cx="9" cy="13" r="1" fill="#fff" stroke="none" /><circle cx="15" cy="13" r="1" fill="#fff" stroke="none" /><path d="M2 13.5v2M22 13.5v2" /></svg>
            <span style={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', background: 'var(--ok,#4ade80)', border: '2px solid var(--acc,#4f46e5)' }} />
          </div>
          <span>ผู้ช่วย AI</span>
          {v.hasUnread && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 99, background: '#fb7185', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk','IBM Plex Sans Thai'" }}>{v.chatUnread}</span>}
        </div>
      )}

      {/* panel */}
      {v.chatOpen && (
        <div data-chat-panel style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 70, width: 392, maxWidth: 'calc(100vw - 32px)', height: 626, maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#0e1017)', border: '1px solid var(--bd,rgba(255,255,255,.1))', borderRadius: 20, boxShadow: '0 30px 90px -22px rgba(0,0,0,.8)', overflow: 'hidden', animation: 'gvgUp .26s ease' }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 13px 14px 16px', background: 'linear-gradient(135deg,rgba(124,131,255,.16),rgba(124,131,255,.03))', borderBottom: '1px solid var(--bd,rgba(255,255,255,.08))', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 6px 16px -6px var(--acc,#4f46e5)' }}>
              <BotIcon s={23} />
              <span style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: '50%', background: 'var(--ok,#4ade80)', border: '2.5px solid #11131b' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
              <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 15, color: 'var(--t1,#eef0f5)' }}>Vera <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--t3,#878e9a)' }}>· ผู้ช่วยเติมเกม</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--t2,#9aa1ad)', marginTop: 1 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok,#4ade80)', animation: 'gvgPulse 1.8s infinite', flexShrink: 0 }} />{v.chatStatusText}
              </div>
            </div>
            <div onClick={v.toggleChat} style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--t2,#9aa1ad)', fontSize: 21, background: 'rgba(255,255,255,.04)' }}>×</div>
          </div>

          {/* messages */}
          <div ref={bodyRef} className="gvg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 14px 6px' }}>
            {v.chatMessages.map((m: any) => (
              <div key={m.id} style={css(m.rowStyle)}>
                {m.avatarShow && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))' }}><BotIcon /></div>
                )}
                <div style={css(m.colStyle)}>
                  {m.isText && <div style={css(m.bubbleStyle)}>{m.text}</div>}
                  {m.isImage && (
                    <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.08))', padding: 4, borderRadius: 14, overflow: 'hidden' }}>
                      <img src={m.img} style={{ display: 'block', maxWidth: 210, width: '100%', borderRadius: 11 }} />
                      {m.hasCaption && <div style={{ padding: '7px 7px 3px', fontSize: 13, color: 'var(--t1,#e7e9f0)' }}>{m.text}</div>}
                    </div>
                  )}
                  {m.isOrder && (
                    <div style={{ width: 252, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.1))', borderRadius: 14, padding: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                        <div style={css('width:40px;height:40px;border-radius:10px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:12px;color:#fff;flex-shrink:0;' + m.order.coverStyle)}>{m.order.short}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.order.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{m.order.pkgLabel}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={css(m.order.statusStyle)}>{m.order.statusLabel}</span>
                        <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontSize: 11.5, color: 'var(--t3b,#6c727e)' }}>{m.order.ref}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <div onClick={m.order.reorder} style={{ flex: 1, cursor: 'pointer', height: 34, display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 9, fontSize: 12, fontWeight: 600, color: '#fff' }}>สั่งซ้ำ</div>
                        <div onClick={m.order.go} style={{ flex: 1, cursor: 'pointer', height: 34, display: 'grid', placeItems: 'center', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#1c1f29)', border: '1px solid var(--bd,rgba(255,255,255,.1))', borderRadius: 9, fontSize: 12, fontWeight: 600, color: 'var(--t2b,#cfd3dc)' }}>ดูประวัติ</div>
                      </div>
                    </div>
                  )}
                  {m.isCards && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 252 }}>
                      {m.cardList.map((c: any, ci: number) => (
                        <div key={ci} onClick={c.go} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.1))', borderRadius: 12, padding: '9px 11px', transition: 'border-color .15s' }}>
                          <div style={css('width:38px;height:38px;border-radius:9px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:11px;color:#fff;flex-shrink:0;' + c.coverStyle)}>{c.short}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3,#878e9a)' }}>เริ่ม {c.fromLabel}</div>
                          </div>
                          <span style={{ fontSize: 17, color: 'var(--acc,#4f46e5)', lineHeight: 1 }}>›</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={css(m.timeStyle)}>{m.time}</div>
                </div>
              </div>
            ))}
            {v.chatTyping && (
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))' }}><BotIcon /></div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.08))', padding: 13, borderRadius: '14px 14px 14px 4px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3,#878e9a)', animation: 'gvgPulse 1s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3,#878e9a)', animation: 'gvgPulse 1s infinite .2s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3,#878e9a)', animation: 'gvgPulse 1s infinite .4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* quick replies */}
          <div className="gvg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '8px 14px 4px', flexShrink: 0 }}>
            {v.chatQuick.map((qr, i) => (
              <div key={i} onClick={qr.send} style={{ flexShrink: 0, cursor: 'pointer', padding: '7px 13px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid rgba(124,131,255,.25)', borderRadius: 99, fontSize: 12, fontWeight: 500, color: 'var(--t2b,#cfd3dc)', whiteSpace: 'nowrap', transition: 'all .15s' }}>{qr.label}</div>
            ))}
          </div>

          {/* pending image preview */}
          {v.hasPendingImg && (
            <div style={{ padding: '8px 14px 0', flexShrink: 0 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={v.chatPendingImg!} style={{ height: 58, borderRadius: 9, display: 'block', border: '1px solid var(--bd2,rgba(255,255,255,.12))' }} />
                <div onClick={v.clearPendingImg} style={{ position: 'absolute', top: -7, right: -7, width: 21, height: 21, borderRadius: '50%', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid rgba(255,255,255,.2)', display: 'grid', placeItems: 'center', fontSize: 13, color: '#fff', cursor: 'pointer', lineHeight: 1 }}>×</div>
              </div>
            </div>
          )}

          {/* input bar */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px 12px', borderTop: '1px solid var(--bd-soft,rgba(255,255,255,.07))', flexShrink: 0 }}>
            <label style={{ width: 42, height: 42, borderRadius: 12, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.1))', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, color: 'var(--t2,#9aa1ad)', transition: 'all .15s' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.48-8.49" /></svg>
              <input type="file" accept="image/*" onChange={v.pickImage} style={{ display: 'none' }} />
            </label>
            <input value={v.chatInput} onChange={v.setChatInput} onKeyDown={v.chatKey} placeholder="พิมพ์ข้อความ…" style={{ flex: 1, minWidth: 0, height: 42, padding: '0 16px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd,rgba(255,255,255,.1))', borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 13.5, outline: 'none', fontFamily: "'IBM Plex Sans Thai'" }} />
            <div onClick={v.sendChat} style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 6px 16px -6px var(--acc,#4f46e5)' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
