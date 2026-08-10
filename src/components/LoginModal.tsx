import type { Vals } from '../vals'
import { LogoMark } from './Logo'

export default function LoginModal({ v }: { v: Vals }) {
  if (!v.showLogin) return null
  return (
    <div onClick={v.closeLogin} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,5,9,.7)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={v.noop} style={{ width: '100%', maxWidth: 400, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 22, padding: 32, boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark />
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 17 }}>เข้าสู่ระบบ</div>
          </div>
          <div onClick={v.closeLogin} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 22 }}>×</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t3,#878e9a)', margin: '0 0 22px' }}>เข้าสู่ระบบเพื่อสะสมแต้ม รับโบนัส และดูประวัติการเติม</p>
        <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>อีเมล / เบอร์โทร</label>
        <input placeholder="you@example.com" style={{ width: '100%', height: 48, padding: '0 16px', marginBottom: 14, background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 14, fontFamily: "'IBM Plex Sans Thai'", outline: 'none' }} />
        <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>รหัสผ่าน</label>
        <input type="password" placeholder="••••••••" style={{ width: '100%', height: 48, padding: '0 16px', marginBottom: 20, background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 14, fontFamily: "'IBM Plex Sans Thai'", outline: 'none' }} />
        <div onClick={v.doLogin} style={{ cursor: 'pointer', height: 50, display: 'grid', placeItems: 'center', background: 'var(--acc,#4f46e5)', borderRadius: 13, fontWeight: 600, fontSize: 15, color: '#fff', boxShadow: '0 12px 30px -14px var(--acc,#4f46e5)', marginBottom: 14 }}>เข้าสู่ระบบ</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div onClick={v.doLogin} style={{ cursor: 'pointer', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 500, color: 'var(--t2b,#c4c8d2)' }}>🟢 LINE</div>
          <div onClick={v.doLogin} style={{ cursor: 'pointer', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 500, color: 'var(--t2b,#c4c8d2)' }}>🔵 Google</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginTop: 18 }}>ยังไม่มีบัญชี? <span style={{ color: 'var(--acc,#4f46e5)', fontWeight: 600, cursor: 'pointer' }}>สมัครสมาชิก</span></div>
      </div>
    </div>
  )
}
