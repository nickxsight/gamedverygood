import { css } from '../css'
import type { Vals } from '../vals'

const step = (label: string) => <div style={{ fontSize: 13.5, color: 'var(--t3,#878e9a)', marginBottom: 14, fontWeight: 600 }}>{label}</div>

export default function Topup({ v }: { v: Vals }) {
  const g: any = v.g
  return (
    <section data-screen-label="Top-up" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>TOP-UP CENTER</div>
          <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-1.2px' }}>เติมเกม</h1>
        </div>
        <div onClick={v.goHistory} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 18px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: 'var(--t2b,#c4c8d2)' }}>🧾 ประวัติการเติม</div>
      </div>

      {/* topup search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420, height: 48, padding: '0 16px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 13, marginBottom: 20 }}>
        <span style={{ color: 'var(--t3b,#6c727e)', fontSize: 16 }}>⌕</span>
        <input value={v.q} onChange={v.setQ} placeholder="ค้นหาเกม..." style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: 'var(--t1,#eef0f5)', fontFamily: "'IBM Plex Sans Thai'" }} />
        {v.hasQuery && <span onClick={v.clearQ} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 16 }}>×</span>}
      </div>

      <div style={{ marginBottom: 30 }}>
        {step('1 · เลือกเกม')}
        {v.pickerNoResult && <div style={{ padding: 24, textAlign: 'center', color: 'var(--t3b,#6c727e)', fontSize: 14, background: 'var(--s-inset,#161922)', borderRadius: 14 }}>ไม่พบเกม "{v.q}"</div>}
        <div className="gvg-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {v.gamePicker.map((game: any) => (
            <div key={game.id} onClick={game.pick} style={css(game.chipStyle)}>
              <div style={css('width:46px;height:46px;border-radius:12px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:14px;color:#fff;margin-bottom:9px; ' + game.coverStyle)}>{game.short}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{game.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div data-resp="topup" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        <div>
          {step(`2 · เลือกแพ็กเกจ ${g.currency}`)}
          <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
            {v.pkgs.map((p: any) => (
              <div key={p.id} onClick={p.pick} style={css(p.cardStyle)}>
                {p.tag && <div style={css(p.tagStyle)}>{p.tag}</div>}
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 24 }}>{p.amount}</div>
                <div style={{ fontSize: 11.5, color: 'var(--good,#16a34a)', fontWeight: 500, height: 15 }}>{p.bonusLabel}</div>
                <div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)', marginTop: 8 }}>{g.currency}</div>
                <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 17, marginTop: 10 }}>฿{p.price}</div>
              </div>
            ))}
          </div>

          {step('3 · ข้อมูลบัญชี')}
          <div data-resp="pay2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 8 }}>Player ID / UID</label>
              <input value={v.playerId} onChange={v.setPlayerId} placeholder="กรอก Player ID" style={{ width: '100%', height: 50, padding: '0 16px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 14, fontFamily: "'IBM Plex Sans Thai'", outline: 'none', transition: 'border-color .2s' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 8 }}>Server / Zone</label>
              <input value={v.serverId} onChange={v.setServerId} placeholder="เช่น Asia / 8001" style={{ width: '100%', height: 50, padding: '0 16px', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 14, fontFamily: "'IBM Plex Sans Thai'", outline: 'none', transition: 'border-color .2s' }} />
            </div>
          </div>

          {step('4 · ช่องทางชำระเงิน')}
          <div data-resp="pay2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {v.pays.map((pay: any) => (
              <div key={pay.id} onClick={pay.pick} style={css(pay.style)}>
                <div style={css('width:38px;height:38px;border-radius:10px;display:grid;place-items:center;font-size:13px;font-weight:700;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';color:#fff; ' + pay.iconStyle)}>{pay.code}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{pay.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t3b,#6c727e)' }}>{pay.note}</div>
                </div>
                <div style={css(pay.radioStyle)} />
              </div>
            ))}
          </div>
        </div>

        {/* summary */}
        <div style={{ position: 'sticky', top: 88, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 20, padding: 24, boxShadow: '0 16px 44px -24px rgba(0,0,0,.18)' }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 20 }}>สรุปคำสั่งซื้อ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 18, borderBottom: '1px solid var(--bd,rgba(255,255,255,.09))', marginBottom: 18 }}>
            <div style={css('width:48px;height:48px;border-radius:12px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:14px;color:#fff; ' + g.coverStyle)}>{g.short}</div>
            <div><div style={{ fontWeight: 600, fontSize: 14.5 }}>{g.name}</div><div style={{ fontSize: 12, color: 'var(--t3b,#6c727e)' }}>{g.genre}</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>แพ็กเกจ</span><span style={{ fontWeight: 600 }}>{v.selAmount} {g.currency}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>โบนัส</span><span style={{ fontWeight: 600, color: 'var(--good,#16a34a)' }}>{v.selBonus}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>Player ID</span><span style={{ fontWeight: 600, fontSize: 12.5 }}>{v.playerIdShown}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>ช่องทาง</span><span style={{ fontWeight: 600 }}>{v.payName}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>ค่าธรรมเนียม</span><span style={{ fontWeight: 600 }}>฿{v.fee}</span></div>
            {v.hasDiscount && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>ส่วนลด ({v.couponCode})</span><span style={{ fontWeight: 600, color: 'var(--ok,#4ade80)' }}>−฿{v.discount}</span></div>}
            {v.hasCredit && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--t3,#878e9a)' }}>เครดิตแต้ม</span><span style={{ fontWeight: 600, color: 'var(--ok,#4ade80)' }}>−฿{v.creditUsed}</span></div>}
          </div>

          {/* coupon */}
          <div style={{ marginBottom: 18 }}>
            {v.noCoupon && (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={v.couponInput} onChange={v.setCoupon} placeholder="กรอกโค้ดส่วนลด" style={{ flex: 1, minWidth: 0, height: 44, padding: '0 14px', background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, color: 'var(--t1,#eef0f5)', fontSize: 13, fontFamily: "'IBM Plex Sans Thai'", outline: 'none', textTransform: 'uppercase' }} />
                  <div onClick={v.applyCoupon} style={{ cursor: 'pointer', height: 44, padding: '0 18px', display: 'grid', placeItems: 'center', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd2,rgba(255,255,255,.14))', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--t1,#eef0f5)', whiteSpace: 'nowrap' }}>ใช้โค้ด</div>
                </div>
                {v.couponError && <div style={{ fontSize: 11.5, color: '#f87171', marginTop: 7 }}>{v.couponError}</div>}
                <div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)', marginTop: 7 }}>ลอง: WELCOME10 · GVG50 · FLASH20</div>
              </div>
            )}
            {v.coupon && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 14px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.35)', borderRadius: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><span style={{ color: 'var(--ok,#4ade80)' }}>🎟️</span><span style={{ fontSize: 12.5, color: 'var(--ok,#4ade80)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.couponLabel}</span></div>
                <span onClick={v.removeCoupon} style={{ cursor: 'pointer', color: 'var(--t3,#878e9a)', fontSize: 16, flexShrink: 0 }}>×</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0', borderTop: '1px solid var(--bd,rgba(255,255,255,.09))', marginBottom: 18 }}>
            <span style={{ fontSize: 14, color: 'var(--t2,#9aa1ad)' }}>ยอดชำระทั้งหมด</span>
            <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 28 }}>฿{v.grandTotal}</span>
          </div>

          {v.payIdle && (
            <div onClick={v.pay} style={{ cursor: 'pointer', height: 52, display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 14, fontWeight: 600, fontSize: 15.5, color: '#fff', boxShadow: '0 12px 30px -14px var(--acc,#4f46e5)' }}>{v.payBtnLabel}</div>
          )}

          {/* awaiting payment: QR / method panel */}
          {v.payAwaiting && (
            <div style={{ background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.18))', borderRadius: 16, padding: 20, animation: 'gvgUp .3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
                <div style={css('width:40px;height:40px;border-radius:11px;display:grid;place-items:center;font-size:13px;font-weight:700;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';color:#fff; ' + v.payPanel.iconStyle)}>{v.payPanel.code}</div>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--t1,#eef0f5)' }}>{v.payPanel.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3,#878e9a)' }}>{v.payPanel.sub}</div>
                </div>
              </div>
              {v.payPanel.showQr && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
                  {v.payQrEl}
                  <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, borderRadius: 11, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 4px #fff' }}><div style={css('width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:11px;color:#fff; ' + v.payPanel.iconStyle)}>{v.payPanel.code}</div></div>
                </div>
              )}
              {v.payPanel.showWallet && (
                <div onClick={v.payPanel.copyWallet} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 14px', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 11, marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontSize: 13, color: 'var(--t2b,#c4c8d2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.payPanel.wallet}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--acc,#4f46e5)', flexShrink: 0 }}>คัดลอก</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--s-card,#13151d)', borderRadius: 11, marginBottom: 14 }}>
                <div><div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)' }}>ยอดที่ต้องชำระ</div><div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 20, color: 'var(--t1,#eef0f5)' }}>{v.payPanel.amount}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)' }}>อ้างอิง</div><div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontSize: 13, color: 'var(--t2,#9aa1ad)' }}>{v.payPanel.ref}</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 10, marginBottom: 14, fontSize: 12.5, color: 'var(--acc,#4f46e5)' }}>
                <span style={{ width: 15, height: 15, border: '2px solid var(--acc,#4f46e5)', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'gvgSpin .8s linear infinite' }} />
                กำลังรอตรวจสอบยอดเงินอัตโนมัติ...
              </div>
              <div onClick={v.receivePayment} style={{ cursor: 'pointer', height: 48, display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 12, fontWeight: 600, fontSize: 14.5, color: '#fff', marginBottom: 9 }}>ฉันชำระเงินแล้ว</div>
              <div onClick={v.cancelPay} style={{ cursor: 'pointer', height: 40, display: 'grid', placeItems: 'center', fontSize: 13, color: 'var(--t3,#878e9a)' }}>ยกเลิก</div>
            </div>
          )}

          {/* order status steps */}
          {v.payProcessing && (
            <div style={{ background: 'var(--s-inset,#161922)', border: '1px solid var(--bd-soft,rgba(255,255,255,.06))', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t2b,#c4c8d2)', marginBottom: 14 }}>สถานะคำสั่งซื้อ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {v.orderSteps.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={css(st.dotStyle)}>{st.mark}</div>
                    <span style={{ fontSize: 13, fontWeight: st.weight, color: st.color }}>{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--ok,#4ade80)' }}>🛡️ การันตีคืนเงิน 100% หากเติมไม่สำเร็จ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--t3b,#6c727e)' }}>🔒 ชำระเงินปลอดภัยผ่านระบบเข้ารหัส SSL</div>
          </div>
        </div>
      </div>
    </section>
  )
}
