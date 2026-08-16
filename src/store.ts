import { create } from 'zustand'
import { GAMES, PKGS, COUPONS, TICKER, SEED_ORDERS, mergedGames, type Game, type Order, type Pkg } from './data'

export type SearchFocus = false | 'nav' | 'hero' | 'catalog'
export type PayStatus = 'idle' | 'awaiting' | 'processing' | 'success'
export type ChatKind = 'text' | 'image' | 'order' | 'cards'
export type ChatMsg = {
  id: number; role: 'bot' | 'user'; kind: ChatKind
  text?: string; img?: string; order?: Order; cards?: string[]; time: string
}
export type Toast = { msg: string; icon: string; k: number }

export type User = { email: string; name: string }
export type ServerArticle = { id: string; cat: string; title: string; excerpt: string; body: string[]; time: string }

export type State = {
  route: string; game: string; pkg: string; playerId: string; serverId: string
  pay: string; news: string; tool: string; q: string
  payStatus: PayStatus; payRef: string
  tickerIdx: number; promoIdx: number; active: Record<string, boolean>
  pbFilter: string; boardPage: number; myOrders: Order[] | null
  searchFocus: SearchFocus; catCat: string; catPlatform: string; catSort: string
  loggedIn: boolean; showLogin: boolean; favorites: Record<string, boolean>
  couponInput: string; coupon: { code: string; type: 'pct' | 'fixed'; value: number; label: string } | null; couponError: string
  checkedDays: number; claimedToday: boolean; redeemCredit: number; redeemedPts: number
  refCopied: boolean; lookupRef: string; lookupDone: boolean; article: string; toolModal: string | null
  tSens: string; tDpi: string; tBudget: string; now: number; theme: 'day' | 'night'
  chatOpen: boolean; chatInput: string; chatTyping: boolean; chatPendingImg: string | null
  chatUnread: number; liveCount: number; toast: Toast | null; chatLog: ChatMsg[]
  saleEnd: number
  // membership
  user: User | null; points: number | null; authBusy: boolean; authError: string
  // admin-managed content
  isAdmin: boolean; pkgMap: Record<string, Pkg[]>; articles: ServerArticle[] | null
  siteTicker: string[] | null; customCoupons: boolean
  serverImages: Record<string, number>
  customGames: Game[]; hiddenGames: string[]
  legalDoc: string; refCode: string
}

type Actions = {
  set: (patch: Partial<State> | ((s: State) => Partial<State>)) => void
  orders: () => Order[]
  go: (route: string) => void
  openGame: (id: string) => void
  reorder: (gid: string, pkg: string) => void
  doPay: () => void
  receivePayment: () => void
  cancelPay: () => void
  toggleFav: (id: string, e?: { stopPropagation?: () => void }) => void
  applyCoupon: () => void
  removeCoupon: () => void
  claimCheckin: () => void
  redeemPoints: (cost: number, credit: number) => void
  copyRef: (code: string) => void
  doLookup: () => void
  openArticle: (id: string) => void
  openTool: (id: string) => void
  closeTool: () => void
  toggleTheme: () => void
  // membership
  loadMe: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, refCode?: string) => Promise<boolean>
  logout: () => Promise<void>
  loadContent: () => Promise<void>
  applyPackages: (packages: Record<string, any[]>) => void
  setServerImage: (slotId: string, ts: number | null) => void
  uploadSlotImage: (slotId: string, file: File | null | undefined) => Promise<boolean>
  removeSlotImage: (slotId: string) => Promise<void>
  showToast: (msg: string, icon?: string) => void
  // chat
  toggleChat: () => void
  pushMsg: (msg: Omit<ChatMsg, 'id' | 'time'>) => void
  sendChatText: () => void
  sendQuick: (text: string) => void
  attachOrder: () => void
  pickImageFile: (file: File | null) => void
}

export type Store = State & Actions

const timers: Record<string, ReturnType<typeof setTimeout>> = {}

function nowTime(): string {
  const d = new Date()
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}
function scrollTop() { if (typeof window !== 'undefined') window.scrollTo(0, 0) }

// ── keyword fallback bot ─────────────────────────────────────────────────────
function detectGames(t: string, games: Game[]): string[] {
  const found: string[] = []
  for (const gm of games) {
    const keys: string[] = []
    if (gm.short.length >= 3) keys.push(gm.short.toLowerCase())
    gm.name.toLowerCase().split(/\s+/).forEach((w) => { if (w.length >= 4) keys.push(w) })
    ;(gm.alias || '').toLowerCase().split(/\s+/).forEach((w) => { if (w.length >= 3) keys.push(w) })
    if (keys.some((k) => t.includes(k))) found.push(gm.id)
  }
  return found.slice(0, 3)
}
function composeReply(text: string, hadImg: boolean, orders: Order[], games: Game[]): Array<Omit<ChatMsg, 'id' | 'time' | 'role'>> {
  const t = (text || '').toLowerCase()
  const has = (...a: string[]) => a.some((k) => t.includes(k))
  if (hadImg) return [{ kind: 'text', text: 'ได้รับรูปแล้วค่ะ 📷 ฉันส่งต่อให้ทีมงานตรวจสอบให้นะคะ หากเป็นสลิปการชำระเงิน รบกวนแจ้งเลขออเดอร์ด้วย จะได้ตรวจสอบให้เร็วขึ้นค่ะ' }]
  if (has('สถานะ', 'ออเดอร', 'order', 'เช็ค', 'สลิป', 'ref', '#gvg')) {
    return [{ kind: 'text', text: 'นี่คือออเดอร์ล่าสุดของคุณค่ะ 👇 แตะเพื่อสั่งซ้ำหรือดูประวัติทั้งหมดได้เลย' }, { kind: 'order', order: orders[0] }]
  }
  if (has('โค้ด', 'ส่วนลด', 'promo', 'โปร', 'coupon', 'discount', 'ลด')) {
    return [{ kind: 'text', text: 'ลองใช้โค้ด WELCOME10 รับส่วนลด 10% สำหรับสมาชิกใหม่ได้ค่ะ ✨ ใส่โค้ดได้ที่ช่องส่วนลดในหน้าชำระเงินเลยนะคะ' }]
  }
  if (has('จ่าย', 'ชำระ', 'payment', 'pay', 'พร้อมเพย์', 'promptpay', 'truemoney', 'บัตร', 'crypto')) {
    return [{ kind: 'text', text: 'รองรับ TrueMoney, PromptPay, บัตรเครดิต และ Crypto (USDT) ค่ะ 💳 จ่ายด้วย Crypto ไม่มีค่าธรรมเนียม และเครดิตเข้าหลังชำระเงินค่ะ' }]
  }
  const detected = detectGames(t, games)
  if (detected.length) {
    return [{ kind: 'text', text: 'ได้เลยค่ะ! เลือกเกมที่ต้องการเติมด้านล่างนี้ได้เลย แตะแล้วจะพาไปหน้าเติมพร้อมแพ็กเกจยอดนิยมให้ค่ะ 👇' }, { kind: 'cards', cards: detected }]
  }
  if (has('เติม', 'topup', 'top up', 'recharge', 'เพชร', 'diamond', 'vp', 'uc')) {
    return [{ kind: 'text', text: 'อยากเติมเกมไหนดีคะ? นี่คือเกมยอดนิยมที่คนเติมเยอะตอนนี้ แตะเลือกได้เลยค่ะ 🔥' }, { kind: 'cards', cards: ['freefire', 'valorant', 'rov'] }]
  }
  if (has('สวัสดี', 'hello', 'hi', 'หวัดดี', 'ดีครับ', 'ดีค่ะ')) {
    return [{ kind: 'text', text: 'สวัสดีค่ะ 😊 ยินดีช่วยเหลือเรื่องเติมเกมและออเดอร์ทุกอย่าง ลองพิมพ์ชื่อเกมที่อยากเติม หรือเลือกเมนูลัดด้านล่างได้เลยนะคะ' }]
  }
  if (has('ขอบคุณ', 'thank', 'thx')) {
    return [{ kind: 'text', text: 'ยินดีค่ะ 🙏 มีอะไรให้ช่วยอีกบอกได้เลยนะคะ ขอให้สนุกกับเกมค่ะ!' }]
  }
  return [{ kind: 'text', text: 'ขอโทษค่ะ ฉันอาจจะยังไม่เข้าใจคำถามทั้งหมด แต่ช่วยได้ในเรื่องเหล่านี้ค่ะ — เลือกเมนูลัดด้านล่าง หรือพิมพ์ชื่อเกมที่อยากเติมได้เลยนะคะ 💬' }]
}
function buildPrompt(latest: string, hadImg: boolean, chatLog: ChatMsg[], orders: Order[], games: Game[]): string {
  const gameList = games.map((g) => `- ${g.id}: ${g.name} (${g.currency}, เริ่ม ฿${g.from})`).join('\n')
  const o = orders[0]
  const og = games.find((x) => x.id === o.gid)
  const stTxt = o.status === 'success' ? 'สำเร็จ' : o.status === 'pending' ? 'กำลังดำเนินการ' : 'ไม่สำเร็จ'
  const hist = chatLog.slice(-8).map((m) => {
    const who = m.role === 'bot' ? 'Vera' : 'ลูกค้า'
    let c = m.text || ''
    if (m.kind === 'order') c = '[การ์ดออเดอร์]'
    else if (m.kind === 'cards') c = '[การ์ดเกม]'
    else if (m.kind === 'image') c = '[ลูกค้าส่งรูปภาพ/สลิป] ' + (m.text || '')
    return `${who}: ${c}`
  }).join('\n')
  return `คุณคือ "Vera" ผู้ช่วย AI หญิงของเว็บเติมเกม gamedverygood พูดจาสุภาพ เป็นกันเอง ลงท้ายด้วย "ค่ะ/นะคะ" ตอบสั้นกระชับไม่เกิน 3 ประโยค ใช้อิโมจิได้พอประมาณ ห้ามแต่งข้อมูลที่ไม่มีในร้าน

ข้อมูลร้าน
เกมที่เติมได้:
${gameList}

โปรโมชั่น: โค้ด WELCOME10 ลด 10% สำหรับสมาชิกใหม่ และจ่ายด้วย Crypto (USDT) ไม่มีค่าธรรมเนียม
ช่องทางชำระเงิน: TrueMoney, PromptPay, บัตรเครดิต, Crypto (USDT)
ออเดอร์ล่าสุดของลูกค้า: ${o.ref} · เกม ${og ? og.name : ''} · สถานะ ${stTxt}

กติกาการตอบ (สำคัญมาก)
- ตอบเป็นภาษาไทยเท่านั้น เป็น Vera
- ถ้าลูกค้าอยากเติมหรือสนใจเกมใดเป็นพิเศษ ให้พิมพ์แท็ก [GAME:<id>] ต่อท้ายข้อความ (ใส่ได้สูงสุด 3 เกม โดยใช้ id จากรายการด้านบน) เพื่อให้ระบบขึ้นปุ่มลัดไปหน้าเติมเกมนั้น
- ถ้าลูกค้าถามเรื่องสถานะ/ออเดอร์/สลิปการจ่ายเงิน ให้พิมพ์แท็ก [ORDER] ต่อท้าย เพื่อแสดงการ์ดออเดอร์ล่าสุด
- ห้ามอธิบายเรื่องแท็กให้ลูกค้าเห็น และห้ามแต่งเลขออเดอร์เอง

บทสนทนาล่าสุด
${hist}

ตอบข้อความล่าสุดของลูกค้าในฐานะ Vera:`
}

// ── membership API helpers ───────────────────────────────────────────────────
async function api(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const resp = await fetch(path, body === undefined
      ? { method: 'GET' }
      : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await resp.json().catch(() => ({}))
    return { ok: resp.ok, status: resp.status, data }
  } catch {
    return { ok: false, status: 0, data: { message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง' } }
  }
}

function fmtOrderTime(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const useStore = create<Store>((set, get) => {
  const patch = (p: Partial<State> | ((s: State) => Partial<State>)) => set(p as any)

  // Hydrate store fields from a /api/me-shaped payload.
  const applyMe = (d: any) => {
    if (!d || !d.user) return
    const favorites: Record<string, boolean> = {}
    for (const id of d.favorites || []) favorites[id] = true
    const myOrders: Order[] = (d.orders || []).map((o: any) => ({
      gid: o.gid, pkg: o.pkg, status: o.status, ref: o.ref, time: fmtOrderTime(o.createdAt),
      amount: o.amount || undefined, price: o.price,
    }))
    set({
      user: d.user, loggedIn: true, points: d.points, redeemCredit: d.redeemCredit,
      checkedDays: d.checkedDays, claimedToday: d.claimedToday, favorites,
      myOrders, redeemedPts: 0, authError: '', isAdmin: !!d.isAdmin, refCode: d.refCode || '',
    })
  }
  const pushMsg: Actions['pushMsg'] = (msg) => set((s) => {
    const last = s.chatLog[s.chatLog.length - 1]
    return { chatLog: [...s.chatLog, { id: (last ? last.id : 0) + 1, time: nowTime(), ...msg } as ChatMsg] }
  })
  const showToast: Actions['showToast'] = (msg, icon) => {
    set({ toast: { msg, icon: icon || '✓', k: Date.now() } })
    if (timers.tt) clearTimeout(timers.tt)
    timers.tt = setTimeout(() => set({ toast: null }), 2400)
  }
  const orders = () => get().myOrders || SEED_ORDERS
  const liveGames = () => mergedGames(get().customGames, get().hiddenGames)

  async function botRespond(text: string, hadImg: boolean) {
    set({ chatTyping: true })
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(text, hadImg, get().chatLog, orders(), liveGames()) }),
      })
      if (!resp.ok) throw new Error('proxy ' + resp.status)
      const data = await resp.json()
      const raw = (data && data.text) || ''
      set({ chatTyping: false })
      applyAiReply(raw, text, hadImg)
    } catch {
      // Fallback: keyword bot (also the offline path)
      if (timers.ct) clearTimeout(timers.ct)
      timers.ct = setTimeout(() => {
        set({ chatTyping: false })
        composeReply(text, hadImg, orders(), liveGames()).forEach((r) => pushMsg({ role: 'bot', ...r }))
      }, 550 + Math.random() * 350)
    }
  }
  function applyAiReply(raw: string, text: string, hadImg: boolean) {
    let txt = (raw || '').trim()
    if (!txt) { composeReply(text, hadImg, orders(), liveGames()).forEach((r) => pushMsg({ role: 'bot', ...r })); return }
    const games: string[] = []
    txt = txt.replace(/\[GAMES?:\s*([a-z0-9,\s]+?)\s*\]/gi, (_m, ids: string) => { ids.toLowerCase().split(/[,\s]+/).forEach((id) => { if (id) games.push(id) }); return '' })
    let wantOrder = false
    txt = txt.replace(/\[ORDER\]/gi, () => { wantOrder = true; return '' })
    txt = txt.replace(/\s{2,}/g, ' ').trim()
    if (txt) pushMsg({ role: 'bot', kind: 'text', text: txt })
    if (wantOrder) pushMsg({ role: 'bot', kind: 'order', order: orders()[0] })
    const valid = games.filter((id) => liveGames().some((g) => g.id === id)).slice(0, 3)
    if (valid.length) pushMsg({ role: 'bot', kind: 'cards', cards: valid })
  }

  return {
    // ── initial state ──
    route: 'home', game: 'ro3', pkg: 'p3', playerId: '', serverId: '', pay: 'crypto',
    news: 'all', tool: 'all', q: '', payStatus: 'idle', payRef: '', tickerIdx: 0, promoIdx: 0,
    active: {}, pbFilter: 'all', boardPage: 0, myOrders: null, searchFocus: false,
    catCat: 'all', catPlatform: 'all', catSort: 'popular',
    loggedIn: false, showLogin: false, favorites: { freefire: true, ro3: true }, couponInput: '', coupon: null, couponError: '',
    checkedDays: 3, claimedToday: false, redeemCredit: 0, redeemedPts: 0, refCopied: false, lookupRef: '', lookupDone: false, article: 'n1', toolModal: null,
    tSens: '0.45', tDpi: '800', tBudget: '2000', now: Date.now(), theme: 'night',
    chatOpen: false, chatInput: '', chatTyping: false, chatPendingImg: null, chatUnread: 1, liveCount: 1287, toast: null,
    saleEnd: Date.now() + 3 * 3600 * 1000 + 47 * 60 * 1000,
    chatLog: [{ id: 1, role: 'bot', kind: 'text', text: 'สวัสดีค่ะ! ฉันชื่อ Vera ผู้ช่วยเติมเกมของ gamedverygood ถามได้เลยว่าอยากเติมเกมอะไร เช็คสถานะออเดอร์ หรือสอบถามโปรโมชั่นค่ะ', time: '09:24' }],
    user: null, points: null, authBusy: false, authError: '',
    isAdmin: false, pkgMap: {}, articles: null, siteTicker: null, customCoupons: false, serverImages: {},
    customGames: [], hiddenGames: [],
    legalDoc: 'terms', refCode: '',

    // ── actions ──
    set: patch,
    orders,
    go: (route) => { set({ route, payStatus: 'idle' }); scrollTop() },
    openGame: (id) => { set({ game: id, route: 'detail', payStatus: 'idle' }); scrollTop() },
    reorder: (gid, pkg) => { const gm = liveGames().find((x) => x.id === gid); showToast('กำลังพาไปเติม ' + (gm ? gm.name : 'เกม'), '⚡'); set({ game: gid, pkg, route: 'topup', payStatus: 'idle' }); scrollTop() },

    doPay: () => {
      if (get().payStatus !== 'idle') return
      set({ payStatus: 'awaiting', payRef: 'GVG' + Math.floor(100000 + Math.random() * 899999) })
      timers.payWatch = setTimeout(() => get().receivePayment(), 7000)
    },
    receivePayment: () => {
      if (get().payStatus !== 'awaiting') return
      if (timers.payWatch) clearTimeout(timers.payWatch)
      showToast('ระบบได้รับยอดเงินแล้ว กำลังเติม', '✓')
      set({ payStatus: 'processing' })
      timers.pt = setTimeout(() => {
        const st = get()
        const ref = '#' + (st.payRef || ('GVG' + Math.floor(8900 + Math.random() * 99)))
        const newOrder: Order = { gid: st.game, pkg: st.pkg, status: 'success', time: 'เมื่อสักครู่', ref }
        set({ payStatus: 'success', myOrders: [newOrder, ...orders()], coupon: null, couponInput: '', redeemCredit: 0 })
        // Logged-in: persist the order server-side (earns points, burns credit).
        if (st.user) {
          const list = st.pkgMap[st.game]?.length ? st.pkgMap[st.game] : PKGS
          const pk = list.find((p) => p.id === st.pkg) || list[0]
          const creditUsed = Math.min(st.redeemCredit, pk.price)
          api('/api/orders', { gid: st.game, pkg: st.pkg, ref, price: pk.price, amount: pk.amount, creditUsed, couponCode: st.coupon ? st.coupon.code : undefined })
            .then((r) => { if (r.ok) applyMe(r.data) })
        }
      }, 1900)
    },
    cancelPay: () => { if (timers.payWatch) clearTimeout(timers.payWatch); set({ payStatus: 'idle' }) },

    toggleFav: (id, e) => {
      e?.stopPropagation?.()
      const willFav = !get().favorites[id]
      const gm = liveGames().find((x) => x.id === id)
      showToast(willFav ? 'เพิ่ม ' + (gm ? gm.name : '') + ' ในรายการโปรด' : 'นำออกจากรายการโปรดแล้ว', willFav ? '♥' : '♡')
      set((s) => { const f = { ...s.favorites }; if (f[id]) delete f[id]; else f[id] = true; return { favorites: f } })
      if (get().user) api('/api/me/favorites', { gameId: id, faved: willFav })
    },
    applyCoupon: async () => {
      const st = get()
      const code = (st.couponInput || '').trim().toUpperCase()
      if (!code) return
      const list = st.pkgMap[st.game]?.length ? st.pkgMap[st.game] : PKGS
      const pk = list.find((p) => p.id === st.pkg) || list[Math.min(2, list.length - 1)]
      const r = await api('/api/coupons/validate', { code, price: pk.price })
      if (r.ok) set({ coupon: { code: r.data.code, type: r.data.type, value: r.data.value, label: r.data.label }, couponError: '' })
      else {
        // Offline/dev fallback: the built-in demo codes.
        if (r.status === 0 && COUPONS[code]) { set({ coupon: { code, ...COUPONS[code] }, couponError: '' }); return }
        set({ coupon: null, couponError: (r.data && r.data.message) || 'ไม่พบโค้ดนี้ ลองใหม่อีกครั้ง' })
      }
    },
    removeCoupon: () => set({ coupon: null, couponInput: '', couponError: '' }),
    claimCheckin: () => {
      if (get().claimedToday) return
      if (get().user) {
        api('/api/me/checkin', {}).then((r) => {
          if (r.ok) {
            set({ points: r.data.points, checkedDays: r.data.checkedDays, claimedToday: true })
            showToast('เช็คอินสำเร็จ +' + r.data.reward + ' แต้ม', '⭐')
          } else if (r.status === 409) set({ claimedToday: true })
        })
        return
      }
      set((s) => ({ claimedToday: true, checkedDays: Math.min(7, s.checkedDays + 1) }))
    },
    redeemPoints: (cost, credit) => {
      if (get().user) {
        api('/api/me/redeem', { cost }).then((r) => {
          if (r.ok) { set({ points: r.data.points, redeemCredit: r.data.redeemCredit }); showToast('แลกแต้มสำเร็จ', '🎁') }
          else showToast(r.data.message || 'แลกแต้มไม่สำเร็จ', '⚠️')
        })
        return
      }
      set((s) => { if ((1250 + s.checkedDays * 20 - s.redeemedPts) < cost) return {}; return { redeemCredit: s.redeemCredit + credit, redeemedPts: s.redeemedPts + cost } })
    },
    copyRef: (code) => { try { navigator.clipboard?.writeText(code) } catch { /* */ } set({ refCopied: true }); setTimeout(() => set({ refCopied: false }), 1800) },
    doLookup: () => set({ lookupDone: true }),
    openArticle: (id) => { set({ article: id, route: 'article' }); scrollTop() },
    openTool: (id) => set({ toolModal: id }),
    closeTool: () => set({ toolModal: null }),
    toggleTheme: () => set((s) => { const next = s.theme === 'day' ? 'night' : 'day'; try { localStorage.setItem('gvg-theme', next) } catch { /* */ } return { theme: next } }),
    showToast,

    // ── membership ──
    loadMe: async () => {
      const r = await api('/api/me')
      if (r.ok && r.data && r.data.user) applyMe(r.data)
    },
    applyPackages: (packages) => {
      const pkgMap: Record<string, Pkg[]> = {}
      for (const [gid, list] of Object.entries(packages || {})) {
        pkgMap[gid] = (list as any[]).map((p) => ({ id: p.id, amount: p.amount, price: p.price, bonus: p.bonus, tag: p.tag || '' }))
      }
      set({ pkgMap })
    },
    setServerImage: (slotId, ts) => set((s) => {
      const m = { ...s.serverImages }
      if (ts) m[slotId] = ts; else delete m[slotId]
      return { serverImages: m }
    }),
    uploadSlotImage: async (slotId, file) => {
      if (!file || !['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type)) {
        showToast('รองรับเฉพาะไฟล์รูป PNG / JPG / WebP', '⚠️')
        return false
      }
      try {
        // Downscale + re-encode to WebP so uploads stay small.
        const bitmap = await createImageBitmap(file)
        const cap = 1200
        const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height))
        const w = Math.max(1, Math.round(bitmap.width * scale))
        const h = Math.max(1, Math.round(bitmap.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
        bitmap.close?.()
        const dataUrl = canvas.toDataURL('image/webp', 0.85)
        const resp = await fetch('/api/admin/images/' + slotId, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }),
        })
        const data = await resp.json().catch(() => ({}))
        if (resp.ok) {
          get().setServerImage(slotId, data.updatedAt)
          showToast('อัปเดตรูปแล้ว — ลูกค้าเห็นทันที', '🖼️')
          return true
        }
        showToast(data.message || 'อัปโหลดรูปไม่สำเร็จ', '⚠️')
      } catch {
        showToast('อ่านไฟล์รูปไม่สำเร็จ', '⚠️')
      }
      return false
    },
    removeSlotImage: async (slotId) => {
      const resp = await fetch('/api/admin/images/' + slotId, { method: 'DELETE' })
      if (resp.ok) { get().setServerImage(slotId, null); showToast('ลบรูปแล้ว กลับไปใช้พื้นไล่สี', '🗑️') }
    },
    loadContent: async () => {
      const [pk, ar, si, im, gm] = await Promise.all([api('/api/packages'), api('/api/articles'), api('/api/site'), api('/api/images'), api('/api/games')])
      if (gm.ok && gm.data) set({ customGames: gm.data.games || [], hiddenGames: gm.data.hidden || [] })
      if (pk.ok && pk.data) get().applyPackages(pk.data.packages || {})
      if (ar.ok && ar.data && Array.isArray(ar.data.articles)) {
        set({
          articles: ar.data.articles.map((a: any) => ({
            id: a.id, cat: a.cat, title: a.title, excerpt: a.excerpt, body: a.body,
            time: fmtOrderTime(a.createdAt),
          })),
        })
      }
      if (si.ok && si.data) set({ siteTicker: si.data.ticker || null, customCoupons: !!si.data.customCoupons })
      if (im.ok && im.data && im.data.slots) set({ serverImages: im.data.slots })
    },
    login: async (email, password) => {
      set({ authBusy: true, authError: '' })
      const r = await api('/api/auth/login', { email, password })
      set({ authBusy: false })
      if (r.ok) {
        applyMe(r.data)
        set({ showLogin: false })
        showToast('ยินดีต้อนรับกลับมา 👋', '✓')
        return true
      }
      set({ authError: (r.data && r.data.message) || 'เข้าสู่ระบบไม่สำเร็จ' })
      return false
    },
    register: async (email, password, name, refCode) => {
      set({ authBusy: true, authError: '' })
      const r = await api('/api/auth/register', { email, password, name, refCode: (refCode || '').trim() || undefined })
      set({ authBusy: false })
      if (r.ok) {
        applyMe(r.data)
        set({ showLogin: false })
        showToast('สมัครสมาชิกสำเร็จ รับ 100 แต้มต้อนรับ 🎉', '✓')
        return true
      }
      set({ authError: (r.data && r.data.message) || 'สมัครสมาชิกไม่สำเร็จ' })
      return false
    },
    logout: async () => {
      await api('/api/auth/logout', {})
      set({
        user: null, loggedIn: false, points: null, myOrders: null, isAdmin: false, refCode: '',
        favorites: { freefire: true, ro3: true }, checkedDays: 3, claimedToday: false,
        redeemCredit: 0, redeemedPts: 0, authError: '',
        route: get().route === 'admin' ? 'home' : get().route,
      })
      showToast('ออกจากระบบแล้ว', '👋')
    },

    // ── chat ──
    toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen, chatUnread: 0 })),
    pushMsg,
    sendChatText: () => {
      const text = (get().chatInput || '').trim()
      const img = get().chatPendingImg
      if (!text && !img) return
      if (img) pushMsg({ role: 'user', kind: 'image', img, text })
      else pushMsg({ role: 'user', kind: 'text', text })
      set({ chatInput: '', chatPendingImg: null })
      botRespond(text, !!img)
    },
    sendQuick: (text) => { pushMsg({ role: 'user', kind: 'text', text }); botRespond(text, false) },
    attachOrder: () => {
      const o = orders()[0]
      pushMsg({ role: 'user', kind: 'order', order: o })
      set({ chatTyping: true })
      if (timers.ct) clearTimeout(timers.ct)
      timers.ct = setTimeout(() => {
        set({ chatTyping: false })
        const st = o.status
        const txt = st === 'success'
          ? 'ออเดอร์ ' + o.ref + ' เติมสำเร็จเรียบร้อยแล้วค่ะ ✅ ไอเทมเข้าบัญชีเกมของคุณแล้ว หากยังไม่เห็น ลองรีสตาร์ทเกมดูนะคะ'
          : st === 'pending'
            ? 'ออเดอร์ ' + o.ref + ' กำลังดำเนินการอยู่ค่ะ ⏳ โดยปกติใช้เวลาไม่เกิน 3 นาที ฉันจะแจ้งทันทีที่สำเร็จนะคะ'
            : 'ออเดอร์ ' + o.ref + ' ไม่สำเร็จค่ะ 😢 ระบบคืนเครดิตให้เรียบร้อยแล้ว ต้องการให้ช่วยสั่งซ้ำไหมคะ?'
        pushMsg({ role: 'bot', kind: 'text', text: txt })
      }, 1000)
    },
    pickImageFile: (f) => {
      if (!f) return
      const r = new FileReader()
      r.onload = (ev) => set({ chatPendingImg: (ev.target?.result as string) || null })
      r.readAsDataURL(f)
    },
  }
})
