import { useState } from 'react'
import type { Vals } from '../vals'
import { useStore } from '../store'
import { LogoMark } from './Logo'

const inputStyle = {
  width: '100%', height: 48, padding: '0 16px', marginBottom: 14,
  background: 'var(--s-inset,#161922)', border: '1.5px solid var(--bd2,rgba(255,255,255,.12))',
  borderRadius: 12, color: 'var(--t1,#eef0f5)', fontSize: 14, fontFamily: "'IBM Plex Sans Thai'", outline: 'none',
} as const

export default function LoginModal({ v }: { v: Vals }) {
  const login = useStore((s) => s.login)
  const register = useStore((s) => s.register)
  const authBusy = useStore((s) => s.authBusy)
  const authError = useStore((s) => s.authError)
  const showToast = useStore((s) => s.showToast)
  const setStore = useStore((s) => s.set)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (!v.showLogin) return null

  const submit = () => {
    if (authBusy) return
    if (mode === 'login') login(email, password)
    else register(email, password, name)
  }
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit() }
  const switchMode = (m: 'login' | 'register') => { setMode(m); setStore({ authError: '' }) }

  return (
    <div onClick={v.closeLogin} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(4,5,9,.7)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, backdropFilter: 'blur(15px) saturate(1.4)', WebkitBackdropFilter: 'blur(15px) saturate(1.4)', background: 'var(--s-card,#13151d)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 22, padding: 32, boxShadow: '0 40px 90px -30px rgba(0,0,0,.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark />
            <div style={{ fontFamily: "'Space Grotesk','IBM Plex Sans Thai'", fontWeight: 700, fontSize: 17 }}>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</div>
          </div>
          <div onClick={v.closeLogin} style={{ cursor: 'pointer', color: 'var(--t3b,#6c727e)', fontSize: 22 }}>×</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--t3,#878e9a)', margin: '0 0 18px' }}>
          {mode === 'login'
            ? 'เข้าสู่ระบบเพื่อสะสมแต้ม รับโบนัส และดูประวัติการเติม'
            : 'สมัครฟรี รับ 100 แต้มต้อนรับ สะสมแต้มทุกการเติมและเช็คอินรายวัน'}
        </p>

        {/* mode tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 4, background: 'var(--s-inset,#161922)', borderRadius: 12, marginBottom: 18 }}>
          {(['login', 'register'] as const).map((m) => (
            <div key={m} onClick={() => switchMode(m)} style={{ cursor: 'pointer', height: 38, display: 'grid', placeItems: 'center', borderRadius: 9, fontSize: 13, fontWeight: 600, transition: 'all .2s', background: mode === m ? 'var(--acc,#4f46e5)' : 'transparent', color: mode === m ? '#fff' : 'var(--t3,#878e9a)' }}>
              {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </div>
          ))}
        </div>

        {mode === 'register' && (
          <>
            <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>ชื่อที่ใช้แสดง</label>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onKey} placeholder="เช่น ProGamer" style={inputStyle} />
          </>
        )}
        <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>อีเมล</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} placeholder="you@example.com" style={inputStyle} />
        <label style={{ fontSize: 12, color: 'var(--t3,#878e9a)', display: 'block', marginBottom: 7 }}>รหัสผ่าน {mode === 'register' && <span style={{ color: 'var(--t3b,#6c727e)' }}>(อย่างน้อย 6 ตัวอักษร)</span>}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" style={{ ...inputStyle, marginBottom: authError ? 10 : 20 }} />

        {authError && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 11, fontSize: 12.5, color: '#f87171' }}>{authError}</div>
        )}

        <div onClick={submit} style={{ cursor: authBusy ? 'wait' : 'pointer', opacity: authBusy ? .7 : 1, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: 'var(--acc,#4f46e5)', borderRadius: 13, fontWeight: 600, fontSize: 15, color: '#fff', boxShadow: '0 12px 30px -14px var(--acc,#4f46e5)', marginBottom: 14 }}>
          {authBusy && <span style={{ width: 15, height: 15, border: '2px solid #fff', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'gvgSpin .8s linear infinite' }} />}
          {authBusy ? 'กำลังดำเนินการ...' : (mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก ฟรี')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0 12px', fontSize: 11.5, color: 'var(--t3b,#6c727e)' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--bd-soft,rgba(255,255,255,.07))' }} />หรือ<span style={{ flex: 1, height: 1, background: 'var(--bd-soft,rgba(255,255,255,.07))' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div onClick={() => { window.location.href = '/api/auth/line/start' }} style={{ cursor: 'pointer', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#06C755', borderRadius: 11, fontSize: 13, fontWeight: 600, color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2.5C6.2 2.5 1.5 6.36 1.5 11.13c0 4.27 3.77 7.85 8.86 8.53.35.07.82.23.94.52.11.27.07.68.04.96l-.15.9c-.05.27-.21 1.05.92.57 1.13-.48 6.1-3.59 8.32-6.15 1.53-1.68 2.07-3.39 2.07-5.33 0-4.77-4.7-8.63-10.5-8.63Zm-4.31 11.4H5.6a.55.55 0 0 1-.55-.55V8.98a.55.55 0 0 1 1.1 0v3.82h1.54a.55.55 0 1 1 0 1.1Zm2.13-.55a.55.55 0 0 1-1.1 0V8.98a.55.55 0 0 1 1.1 0v4.37Zm5.06 0a.55.55 0 0 1-.99.33l-2.15-2.93v2.6a.55.55 0 0 1-1.1 0V8.98a.55.55 0 0 1 .99-.33l2.15 2.93v-2.6a.55.55 0 0 1 1.1 0v4.37Zm3.4-2.74a.55.55 0 1 1 0 1.1h-1.53v.99h1.53a.55.55 0 1 1 0 1.1h-2.08a.55.55 0 0 1-.55-.55V8.98c0-.3.24-.55.55-.55h2.08a.55.55 0 1 1 0 1.1h-1.53v.98h1.53Z"/></svg>
            LINE
          </div>
          <div onClick={() => showToast('Google Login กำลังจะมาเร็วๆ นี้', '🔜')} style={{ cursor: 'pointer', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--s-inset,#161922)', border: '1px solid var(--bd2,rgba(255,255,255,.12))', borderRadius: 11, fontSize: 13, fontWeight: 500, color: 'var(--t2b,#c4c8d2)' }}>🔵 Google</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--t3b,#6c727e)', marginTop: 18 }}>
          {mode === 'login' ? <>ยังไม่มีบัญชี? <span onClick={() => switchMode('register')} style={{ color: 'var(--acc,#4f46e5)', fontWeight: 600, cursor: 'pointer' }}>สมัครสมาชิก</span></>
            : <>มีบัญชีอยู่แล้ว? <span onClick={() => switchMode('login')} style={{ color: 'var(--acc,#4f46e5)', fontWeight: 600, cursor: 'pointer' }}>เข้าสู่ระบบ</span></>}
        </div>
      </div>
    </div>
  )
}
