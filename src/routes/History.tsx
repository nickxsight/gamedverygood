import { css } from '../css'
import type { Vals } from '../vals'

export default function History({ v }: { v: Vals }) {
  const lr: any = v.lookupResult
  return (
    <section data-screen-label="History" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px var(--wrap-pad,28px) 0' }}>
      <div onClick={v.goTopup} style={{ cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--t3,#878e9a)', marginBottom: 18 }}>← กลับไปเติมเกม</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <div style={{ fontSize: 12.5, letterSpacing: '1.5px', color: 'var(--acc,#4f46e5)', fontWeight: 600, marginBottom: 10 }}>MY ACCOUNT</div>
          <h1 data-h1 style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-1.2px' }}>ประวัติการเติม</h1>
        </div>
        {v.isMember && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{v.user!.name || 'สมาชิก'}</div>
              <div style={{ fontSize: 12, color: 'var(--t3,#878e9a)' }}>{v.userEmailLabel}</div>
            </div>
            {v.isAdmin && (
              <div onClick={v.goAdmin} style={{ cursor: 'pointer', height: 40, padding: '0 16px', display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 11, fontSize: 13, fontWeight: 600, color: '#fff' }}>🛠️ หลังบ้าน</div>
            )}
            <div onClick={v.doLogout} style={{ cursor: 'pointer', height: 40, padding: '0 16px', display: 'grid', placeItems: 'center', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--t2b,#c4c8d2)' }}>ออกจากระบบ</div>
          </div>
        )}
      </div>

      {!v.isMember && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: '16px 20px', marginBottom: 26, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'rgba(124,131,255,.1)', border: '1px solid rgba(124,131,255,.35)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{ fontSize: 22 }}>👤</span>
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5 }}>ข้อมูลด้านล่างเป็นตัวอย่างสำหรับผู้เยี่ยมชม</div>
              <div style={{ fontSize: 12.5, color: 'var(--t2,#9aa1ad)' }}>สมัครสมาชิกฟรีเพื่อบันทึกประวัติจริง สะสมแต้ม เช็คอินรายวัน และรับ 100 แต้มต้อนรับ</div>
            </div>
          </div>
          <div onClick={v.openLogin} style={{ cursor: 'pointer', height: 42, padding: '0 20px', display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 11, fontSize: 13.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>เข้าสู่ระบบ / สมัครสมาชิก</div>
        </div>
      )}

      {/* account summary */}
      <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 30 }}>
        {v.acctStats.map((a, i) => (
          <div key={i} style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginBottom: 8 }}>{a.label}</div>
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 26, color: a.color }}>{a.value}</div>
          </div>
        ))}
      </div>

      {/* membership tier */}
      <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={css(v.tierBadgeStyle)}>◆ {v.tierLabel}</span>
            <span style={{ fontSize: 13, color: 'var(--t2,#9aa1ad)' }}>รับส่วนลดสมาชิก {v.tierDisc}% ทุกการเติม</span>
          </div>
          {v.tierIsMax && <span style={{ fontSize: 13, color: 'var(--ok,#4ade80)', fontWeight: 600 }}>ระดับสูงสุดแล้ว 🎉</span>}
        </div>
        {v.showNextTier && (
          <div>
            <div style={{ height: 8, background: 'var(--s-inset,#161922)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}><div style={css(v.tierBarStyle)} /></div>
            <div style={{ fontSize: 12, color: 'var(--t3,#878e9a)' }}>เติมอีก ฿{v.tierNeed} เพื่อเลื่อนเป็น {v.nextTierLabel}</div>
          </div>
        )}
      </div>

      {/* check-in */}
      <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 17 }}>เช็คอินรายวัน รับแต้มฟรี</div>
          <div onClick={v.claimCheckin} style={css(v.checkinBtnStyle)}>{v.checkinBtnLabel}</div>
        </div>
        <div className="gvg-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {v.checkDays.map((d) => (
            <div key={d.key} style={css(d.style)}>
              <div style={{ fontSize: 18, color: d.markColor, lineHeight: 1, marginBottom: 6 }}>{d.mark}</div>
              <div style={{ fontSize: 11, color: 'var(--t2,#9aa1ad)' }}>{d.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1,#eef0f5)', marginTop: 2 }}>{d.reward}</div>
            </div>
          ))}
        </div>
      </div>

      {/* points redeem */}
      <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 17 }}>แลกแต้มเป็นเครดิต</div>
          <div style={{ fontSize: 13, color: 'var(--t2,#9aa1ad)' }}>คงเหลือ <span style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, color: 'var(--acc,#4f46e5)' }}>{v.pointsBal}</span> แต้ม</div>
        </div>
        <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {v.redeemOpts.map((o, i) => (
            <div key={i} onClick={o.redeem} style={css(o.style)}>
              <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 18, color: 'var(--t1,#eef0f5)' }}>{o.label}</div>
              <div style={{ fontSize: 12, color: 'var(--t3,#878e9a)', marginTop: 4 }}>ใช้ {o.cost} แต้ม</div>
            </div>
          ))}
        </div>
        {v.hasRedeemCredit && <div style={{ marginTop: 14, padding: '11px 14px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.35)', borderRadius: 11, fontSize: 12.5, color: 'var(--ok,#4ade80)' }}>✓ คุณมีเครดิต ฿{v.redeemCredit} พร้อมใช้ตอนเติมเกมครั้งถัดไป</div>}
      </div>

      <div data-resp="g3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 30 }}>
        {/* referral */}
        <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22 }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>ชวนเพื่อน รับเครดิต</div>
          <p style={{ fontSize: 12.5, color: 'var(--t3,#878e9a)', margin: '0 0 16px', lineHeight: 1.5 }}>เพื่อนเติมครั้งแรก คุณและเพื่อนรับเครดิตคนละ ฿50</p>
          {v.isMember && v.refCode ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, height: 46, display: 'flex', alignItems: 'center', padding: '0 14px', background: 'var(--s-inset,#161922)', border: '1.5px dashed rgba(124,131,255,.4)', borderRadius: 11, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: 'var(--acc,#4f46e5)', fontWeight: 600, overflow: 'hidden' }}>{v.refCode}</div>
              <div onClick={v.copyRef} style={{ cursor: 'pointer', height: 46, padding: '0 18px', display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 11, fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{v.copyLabel}</div>
            </div>
          ) : (
            <div onClick={v.openLogin} style={{ cursor: 'pointer', height: 46, display: 'grid', placeItems: 'center', background: 'var(--s-inset,#161922)', border: '1.5px dashed rgba(124,131,255,.4)', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--acc,#4f46e5)' }}>เข้าสู่ระบบเพื่อรับโค้ดของคุณ →</div>
          )}
        </div>
        {/* order lookup */}
        <div style={{ backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 18, padding: 22 }}>
          <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>เช็คสถานะออเดอร์</div>
          <p style={{ fontSize: 12.5, color: 'var(--t3,#878e9a)', margin: '0 0 16px', lineHeight: 1.5 }}>กรอกเลขอ้างอิงเพื่อตรวจสอบสถานะ</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={v.lookupRef} onChange={v.setLookup} placeholder="เช่น GVG8842" style={{ flex: 1, minWidth: 0, height: 46, padding: '0 14px', background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, color: 'var(--t1,#eef0f5)', fontSize: 13, fontFamily: "'IBM Plex Sans Thai'", outline: 'none' }} />
            <div onClick={v.doLookup} style={{ cursor: 'pointer', height: 46, padding: '0 18px', display: 'grid', placeItems: 'center', backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-input,#181b24)', border: '1px solid var(--bd2,rgba(255,255,255,.14))', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--t1,#eef0f5)' }}>ตรวจสอบ</div>
          </div>
          {v.lookupFound && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 11, padding: 12, background: 'var(--s-inset,#161922)', borderRadius: 12 }}>
              <div style={css('width:38px;height:38px;border-radius:10px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:12px;color:#fff; ' + lr.coverStyle)}>{lr.short}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{lr.name}</div><div style={{ fontSize: 11.5, color: 'var(--t3,#878e9a)' }}>{lr.amount} {lr.currency} · {lr.ref}</div></div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: lr.statusColor }}>{lr.statusLabel}</span>
            </div>
          )}
          {v.lookupMissing && <div style={{ marginTop: 12, padding: '11px 14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 11, fontSize: 12.5, color: '#f87171' }}>ไม่พบออเดอร์นี้ ลองตรวจสอบเลขอ้างอิงอีกครั้ง</div>}
        </div>
      </div>

      <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 600, fontSize: 18, marginBottom: 14 }}>รายการล่าสุด</div>
      {v.orders.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3b,#6c727e)', fontSize: 14, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 16 }}>
          ยังไม่มีประวัติการเติม — <span onClick={v.goTopup} style={{ color: 'var(--acc,#4f46e5)', fontWeight: 600, cursor: 'pointer' }}>เติมเกมครั้งแรกเลย →</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {v.orders.map((o: any) => (
          <div key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd,rgba(255,255,255,.09))', borderRadius: 16, padding: '16px 18px', flexWrap: 'wrap' }}>
            <div style={css('width:50px;height:50px;border-radius:13px;flex-shrink:0;display:grid;place-items:center;font-family:\'Space Grotesk\',\'IBM Plex Sans Thai\';font-weight:700;font-size:14px;color:#fff; ' + o.coverStyle)}>{o.short}</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{o.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--t3b,#6c727e)' }}>{o.amount} {o.currency} · {o.time}</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 16 }}>฿{o.price}</div>
              <div style={{ fontSize: 11, color: 'var(--t3b,#6c727e)', fontFamily: "'JetBrains Mono',monospace" }}>{o.ref}</div>
            </div>
            <span style={css(o.badgeStyle)}>{o.statusLabel}</span>
            <div onClick={o.reorder} style={{ cursor: 'pointer', height: 38, padding: '0 16px', display: 'grid', placeItems: 'center', background: 'rgba(124,131,255,.16)', borderRadius: 10, fontSize: 12.5, fontWeight: 600, color: 'var(--acc,#4f46e5)' }}>เติมซ้ำ</div>
          </div>
        ))}
      </div>
    </section>
  )
}
