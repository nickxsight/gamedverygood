import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { computeVals } from './vals'

import PromoBar from './components/PromoBar'
import Nav from './components/Nav'
import LoginModal from './components/LoginModal'
import Footer from './components/Footer'
import ToolModal from './components/ToolModal'
import Toast from './components/Toast'
import Chat from './components/Chat'
import BottomNav from './components/BottomNav'

import Home from './routes/Home'
import Catalog from './routes/Catalog'
import Topup from './routes/Topup'
import History from './routes/History'
import Tools from './routes/Tools'
import News from './routes/News'
import Article from './routes/Article'
import Detail from './routes/Detail'

// Fixed brand vibe (the design prototype's default "Indigo").
const VIBE = ['#6d6af5', '#8b91ff', '#22c55e']

export default function App() {
  const st = useStore()
  const set = st.set
  const rootRef = useRef<HTMLDivElement>(null)

  // Restore persisted theme + membership session once.
  const loadMe = useStore((s) => s.loadMe)
  useEffect(() => {
    try {
      const t = localStorage.getItem('gvg-theme')
      if (t === 'day' || t === 'night') set({ theme: t })
    } catch { /* */ }
    loadMe()
  }, [set, loadMe])

  // applyTheme: data-theme + body bg + accent vars.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    el.setAttribute('data-theme', st.theme)
    try { document.body.style.background = st.theme === 'day' ? '#e7eaf8' : '#0a0912' } catch { /* */ }
    el.style.setProperty('--acc', VIBE[0])
    el.style.setProperty('--acc2', VIBE[1])
    el.style.setProperty('--good', VIBE[2])
  }, [st.theme])

  // Timers (ticker, promo carousel, clock, live counter, price-board paging).
  useEffect(() => {
    const ti = setInterval(() => set((s) => ({ tickerIdx: (s.tickerIdx + 1) % 5 })), 2600)
    const pi = setInterval(() => set((s) => ({ promoIdx: s.promoIdx + 1 })), 5000)
    const clock = setInterval(() => set({ now: Date.now() }), 1000)
    const lc = setInterval(() => set((s) => ({ liveCount: Math.max(1180, s.liveCount + Math.round((Math.random() - 0.42) * 9)) })), 2200)
    const bp = setInterval(() => set((s) => ({ boardPage: s.boardPage + 1 })), 4200)
    return () => { clearInterval(ti); clearInterval(pi); clearInterval(clock); clearInterval(lc); clearInterval(bp) }
  }, [set])

  const v = computeVals(st)

  return (
    <div ref={rootRef} data-root style={{ ['--wrap-pad' as string]: '28px', position: 'relative', minHeight: '100vh', background: 'var(--s-bg,#0a0b12)', color: 'var(--t1,#eef0f5)', fontFamily: "'IBM Plex Sans Thai','Space Grotesk',system-ui,sans-serif", overflowX: 'hidden' }}>
      {/* aurora / mesh background */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-12%', left: '-8%', width: '46vw', height: '46vw', borderRadius: '50%', background: 'radial-gradient(circle,var(--acc,#4f46e5),transparent 68%)', opacity: .4, filter: 'blur(70px)', animation: 'gvgAur1 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '8%', right: '-10%', width: '42vw', height: '42vw', borderRadius: '50%', background: 'radial-gradient(circle,#fb7185,transparent 68%)', opacity: .32, filter: 'blur(80px)', animation: 'gvgAur2 26s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-16%', left: '28%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,#a855f7,transparent 68%)', opacity: .3, filter: 'blur(90px)', animation: 'gvgAur3 30s ease-in-out infinite' }} />
      </div>
      {/* film grain */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: .05, mixBlendMode: 'overlay', backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')" }} />

      <PromoBar v={v} />
      <Nav v={v} />
      <LoginModal v={v} />

      <main key={v.route} style={{ position: 'relative', zIndex: 1, animation: 'gvgFadeUp .42s cubic-bezier(.2,.7,.3,1)' }}>
        {v.isHome && <Home v={v} />}
        {v.isCatalog && <Catalog v={v} />}
        {v.isTopup && <Topup v={v} />}
        {v.isHistory && <History v={v} />}
        {v.isTools && <Tools v={v} />}
        {v.isNews && <News v={v} />}
        {v.isArticleRoute && <Article v={v} />}
        {v.isDetail && <Detail v={v} />}
      </main>

      <Footer v={v} />
      <ToolModal v={v} />
      <Toast v={v} />
      <Chat v={v} />
      <BottomNav v={v} />
    </div>
  )
}
