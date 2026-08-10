import { GAMES, PKGS, PAYS, TOOLS, NEWS, REVIEWS, TICKER, DAILY, cover, PROMOS, FLASH_DEALS, type Game } from './data'
import type { Store } from './store'

const matchGame = (x: Game, q: string): boolean => {
  if (!q) return true
  const s = q.toLowerCase().trim()
  const hay = (x.name + ' ' + x.short + ' ' + x.genre + ' ' + (x.alias || '')).toLowerCase()
  return s.split(/\s+/).every((tok) => hay.includes(tok))
}
const platMatch = (x: Game, p: string): boolean => {
  if (p === 'all') return true
  if (p === 'mobile') return x.platform === 'mobile' || x.platform === 'cross'
  if (p === 'pc') return x.platform === 'pc' || x.platform === 'cross'
  if (p === 'platform') return x.platform === 'platform'
  return true
}
const scrollTop = () => { if (typeof window !== 'undefined') window.scrollTo(0, 0) }

export function computeVals(st: Store) {
  const s = st
  const setGo = (patch: Record<string, unknown>) => { st.set(patch as never); scrollTop() }

  const g: any = { ...(GAMES.find((x) => x.id === s.game) || GAMES[0]) }
  g.coverStyle = cover(g.c1, g.c2)
  g.slotId = 'img-' + g.id
  const cur = PKGS.find((p) => p.id === s.pkg) || PKGS[0]
  const q = s.q.trim()

  const navDefs = [
    { key: 'home', label: 'หน้าแรก' },
    { key: 'catalog', label: 'เกมทั้งหมด' },
    { key: 'topup', label: 'เติมเกม' },
    { key: 'tools', label: 'Tools' },
    { key: 'news', label: 'ข่าวสาร' },
  ]
  const nav = navDefs.map((n) => {
    const on = s.route === n.key || (n.key === 'topup' && (s.route === 'detail' || s.route === 'history'))
    return {
      ...n, go: () => st.go(n.key),
      style: { cursor: 'pointer', padding: '8px 15px', borderRadius: '10px', fontSize: '14.5px', fontWeight: on ? 600 : 500, transition: 'all .2s', color: on ? 'var(--acc,#4f46e5)' : 'var(--t2,#9aa1ad)', background: on ? 'rgba(124,131,255,.16)' : 'transparent' } as React.CSSProperties,
    }
  })

  const bnDefs = [
    { key: 'home', label: 'หน้าแรก', icon: '🏠' },
    { key: 'topup', label: 'เติมเกม', icon: '⚡' },
    { key: 'tools', label: 'Tools', icon: '🛠️' },
    { key: 'news', label: 'ข่าว', icon: '📰' },
    { key: 'history', label: 'บัญชี', icon: '👤' },
  ]
  const bottomNav = bnDefs.map((b) => {
    const on = s.route === b.key || (b.key === 'topup' && s.route === 'detail') || (b.key === 'history' && s.route === 'history')
    return {
      ...b, go: () => st.go(b.key),
      style: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '7px 15px', borderRadius: '15px', transition: 'all .28s cubic-bezier(.2,.7,.3,1)', color: on ? '#fff' : 'var(--t3b,#6c727e)', background: on ? 'linear-gradient(140deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))' : 'transparent', boxShadow: on ? '0 10px 22px -8px var(--acc,#4f46e5)' : 'none' } as React.CSSProperties,
    }
  })

  const ranked = [...GAMES].sort((a, b) => (DAILY[b.id] || 0) - (DAILY[a.id] || 0))
  const hotIds = new Set(ranked.slice(0, 3).map((x) => x.id))
  const games = GAMES.map((x) => {
    const hot = hotIds.has(x.id)
    const neon = x.c1
    const daily = DAILY[x.id] || 0
    return {
      ...x, coverStyle: cover(x.c1, x.c2), slotId: 'img-' + x.id, open: () => st.openGame(x.id),
      hot, neon, daily, dailyLabel: '🔥 ' + daily.toLocaleString() + ' เติม/วัน',
      faved: !!s.favorites[x.id], toggleFav: (e: any) => st.toggleFav(x.id, e),
      favBtnStyle: `position:absolute;top:9px;right:9px;z-index:4;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:14px;cursor:pointer;background:rgba(8,9,14,.55);backdrop-filter:blur(6px);border:1px solid ${s.favorites[x.id] ? '#fb7185' : 'rgba(255,255,255,.18)'};transition:all .2s;`,
      favIcon: s.favorites[x.id] ? '♥' : '♡', favColor: s.favorites[x.id] ? '#fb7185' : 'var(--t2b,#c4c8d2)',
      cardStyle: hot
        ? `cursor:pointer;position:relative;backdrop-filter:blur(15px) saturate(1.4);-webkit-backdrop-filter:blur(15px) saturate(1.4);background:var(--s-card,#13151d);border:1px solid transparent;border-radius:18px;overflow:hidden;transition:transform .25s;--neon:${neon};animation:gvgNeon 2.4s ease-in-out infinite;`
        : `cursor:pointer;position:relative;backdrop-filter:blur(15px) saturate(1.4);-webkit-backdrop-filter:blur(15px) saturate(1.4);background:var(--s-card,#13151d);border:1px solid var(--bd,rgba(255,255,255,.09));border-radius:18px;overflow:hidden;transition:transform .25s,box-shadow .25s,border-color .25s;`,
      hotBadgeStyle: `position:absolute;bottom:10px;left:10px;z-index:3;display:flex;align-items:center;gap:5px;padding:4px 9px;background:rgba(8,9,14,.62);backdrop-filter:blur(6px);border:1px solid ${neon};border-radius:8px;font-size:10px;font-weight:700;color:${neon};animation:gvgBadgePulse 2s ease-in-out infinite;white-space:nowrap;`,
    }
  })
  const marquee = [...games, ...games]
  const filteredHome = games.filter((x) => matchGame(x, q))
  const homeGames = q ? filteredHome : filteredHome.slice(0, 8)

  // ===== StreamVerse-style poster view-models (no price) =====
  const rankOrder = ranked.map((x) => x.id)
  const posterOf: Record<string, any> = {}
  const posters = games.map((x) => {
    const rk = rankOrder.indexOf(x.id)
    const rating = (4.9 - Math.max(0, rk) * 0.02).toFixed(1)
    const vm = {
      ...x, rating, ratingPill: '★ ' + rating,
      topup: (e: any) => { e?.stopPropagation?.(); st.reorder(x.id, 'p3') },
      posterStyle: `position:relative;aspect-ratio:2/3;border-radius:16px;overflow:hidden;border:1px solid var(--bd2,rgba(255,255,255,.18));box-shadow:0 16px 34px -18px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.28), inset 0 0 0 1px rgba(255,255,255,.05);--pneon:${x.c1};animation:gvgFadeUp .5s both;animation-delay:${Math.min(rk, 11) * 0.04}s; ${x.coverStyle}`,
    }
    posterOf[x.id] = vm
    return vm
  })
  const rankedPosters = ranked.map((x, i) => ({ ...posterOf[x.id], rank: i + 1 }))

  // ===== price board (stock-ticker style) =====
  const daySeed = Math.floor(Date.now() / 86400000)
  const priceBoardAll = GAMES.map((x, i) => {
    const r = Math.sin((daySeed + i * 7.13) * 12.9898) * 43758.5453
    const frac = r - Math.floor(r)
    const pct = +((frac * 24) - 12).toFixed(1)
    const down = pct < 0
    const flat = Math.abs(pct) < 0.6
    const base = x.from
    const prev = Math.max(1, Math.round(base / (1 + pct / 100)))
    return {
      key: 'pb-' + x.id, id: x.id, short: x.short, name: x.name, currency: x.currency, cat: x.cat, genre: x.genre,
      pct, down, flat, grad: 'linear-gradient(135deg,' + x.c1 + ',' + x.c2 + ')', slotId: 'img-' + x.id,
      coverStyle: cover(x.c1, x.c2),
      priceLabel: '฿' + base, prevLabel: '฿' + prev,
      pctLabel: (down ? '▼ ' : (flat ? '● ' : '▲ ')) + Math.abs(pct).toFixed(1) + '%',
      color: flat ? '#9aa1ad' : (down ? '#4ade80' : '#fb7185'),
      chipBg: flat ? 'rgba(154,161,173,.12)' : (down ? 'rgba(74,222,128,.13)' : 'rgba(251,113,133,.13)'),
      chipBd: flat ? 'rgba(154,161,173,.3)' : (down ? 'rgba(74,222,128,.35)' : 'rgba(251,113,133,.35)'),
      moveLabel: down ? 'ราคาลง น่าเติม' : (flat ? 'ราคานิ่ง' : 'ราคาขึ้น'),
      go: () => st.reorder(x.id, 'p3'),
    }
  })
  const priceBoard = priceBoardAll.filter((p) => p.down).sort((a, b) => a.pct - b.pct)
  const priceCount = priceBoard.length
  const priceEmpty = priceBoard.length === 0
  const boardPer = 5
  const boardPages = Math.max(1, Math.ceil(priceBoard.length / boardPer))
  const boardPage = ((s.boardPage % boardPages) + boardPages) % boardPages
  const boardSlice = priceBoard.length
    ? Array.from({ length: boardPer }, (_, i) => priceBoard[(boardPage * boardPer + i) % priceBoard.length])
    : []
  const boardRows = boardSlice.map((p, ri) => ({
    key: p.key + '-' + boardPage + '-' + ri,
    grad: p.grad, short: p.short, name: p.name, currency: p.currency, slotId: p.slotId,
    priceLabel: p.priceLabel, prevLabel: p.prevLabel, pctLabel: p.pctLabel,
    color: p.color, chipBg: p.chipBg, chipBd: p.chipBd,
    rowStyle: `display:grid;grid-template-columns:46px 1fr auto auto;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--bd-soft,rgba(255,255,255,.06));cursor:pointer;animation:gvgFadeUp .4s ${(ri * 0.06).toFixed(2)}s both;transition:background .15s;`,
    go: p.go,
  }))
  const boardDotsEls = Array.from({ length: boardPages }).map((_, i) => ({
    key: 'bd' + i, go: () => st.set({ boardPage: i }),
    style: i === boardPage ? 'width:22px;height:6px;border-radius:99px;background:var(--acc,#4f46e5);cursor:pointer;transition:all .3s;' : 'width:6px;height:6px;border-radius:99px;background:var(--bd2,rgba(255,255,255,.2));cursor:pointer;transition:all .3s;',
  }))
  const boardMultetPage = boardPages > 1
  const priceUpdated = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  const priceDrops = priceBoardAll.filter((p) => p.down).length
  const newPosters = ranked.filter((x) => x.isNew).map((x) => posterOf[x.id])
  const mobaPosters = ranked.filter((x) => x.cat === 'moba').map((x) => posterOf[x.id])
  const rpgPosters = ranked.filter((x) => x.cat === 'rpg').map((x) => posterOf[x.id])
  const searchPosters = filteredHome.map((x) => posterOf[x.id])
  const allPosters = ranked.map((x) => posterOf[x.id])

  // hero carousel
  const heroPool = ranked.slice(0, 5)
  const heroIdx = s.promoIdx % (heroPool.length || 1)
  const heroSrc = heroPool[heroIdx] || heroPool[0]
  const heroBadge = heroSrc.isNew ? 'มาใหม่' : (heroIdx === 0 ? 'อันดับ 1 ตอนนี้' : 'ยอดนิยม')
  const heroSlide = {
    ...posterOf[heroSrc.id], key: 'hero-' + heroSrc.id, desc: heroSrc.desc,
    badge: heroBadge,
    detail: () => st.openGame(heroSrc.id),
    topupGo: () => st.reorder(heroSrc.id, 'p3'),
  }
  const heroDots = heroPool.map((_, i) => ({
    key: 'hd' + i, go: () => st.set({ promoIdx: i }),
    style: i === heroIdx
      ? 'width:26px;height:7px;border-radius:99px;background:#fff;cursor:pointer;transition:all .3s;'
      : 'width:7px;height:7px;border-radius:99px;background:rgba(255,255,255,.4);cursor:pointer;transition:all .3s;',
  }))
  const heroPrev = () => st.set((x) => ({ promoIdx: (x.promoIdx - 1 + heroPool.length) % heroPool.length }))
  const heroNext = () => st.set((x) => ({ promoIdx: (x.promoIdx + 1) % heroPool.length }))

  // genre chips
  const genreDefs = [
    { cat: 'moba', label: 'MOBA', sample: 'rov' },
    { cat: 'rpg', label: 'RPG & ผจญภัย', sample: 'genshin' },
    { cat: 'fps', label: 'FPS', sample: 'valorant' },
    { cat: 'br', label: 'Battle Royale', sample: 'freefire' },
    { cat: 'platform', label: 'บัตร & แพลตฟอร์ม', sample: 'steam' },
    { cat: 'other', label: 'อื่น ๆ', sample: 'roblox' },
  ]
  const genreChips = genreDefs.map((gd) => {
    const sm = GAMES.find((x) => x.id === gd.sample) || GAMES[0]
    const count = GAMES.filter((x) => x.cat === gd.cat).length
    return {
      key: 'gc-' + gd.cat, label: gd.label, countLabel: count + ' เกม',
      coverStyle: cover(sm.c1, sm.c2),
      pick: () => setGo({ catCat: gd.cat, catPlatform: 'all', catSort: 'popular', route: 'catalog' }),
    }
  })

  const heroPkgs = PKGS.slice(0, 3).map((p) => ({
    ...p,
    pick: () => st.set({ pkg: p.id }),
    miniStyle: `cursor:pointer;text-align:center;padding:11px 4px;border-radius:12px;transition:all .2s;background:${p.id === s.pkg ? 'rgba(124,131,255,.16)' : 'var(--s-inset,#161922)'};border:1.5px solid ${p.id === s.pkg ? 'var(--acc,#4f46e5)' : 'transparent'};color:var(--t1,#eef0f5);`,
  }))

  const pkgs = PKGS.map((p) => {
    const sel = p.id === s.pkg
    return {
      ...p,
      bonusLabel: p.bonus ? `+${p.bonus} โบนัส` : 'ไม่มีโบนัส',
      pick: () => st.set({ pkg: p.id, payStatus: 'idle' }),
      pickGo: () => setGo({ pkg: p.id, route: 'topup', payStatus: 'idle' }),
      tagStyle: `position:absolute;top:-9px;left:50%;transform:translateX(-50%);padding:2px 10px;border-radius:99px;font-size:10px;font-weight:600;color:#fff;white-space:nowrap;background:var(--acc,#4f46e5);`,
      cardStyle: `position:relative;cursor:pointer;border-radius:16px;padding:18px 14px;text-align:center;transition:all .2s;background:${sel ? 'rgba(124,131,255,.16)' : 'var(--s-card,#13151d)'};border:1.5px solid ${sel ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
    }
  })

  const related = games.filter((x) => x.id !== g.id).slice(0, 4)

  const pays = PAYS.map((p) => {
    const sel = p.id === s.pay
    return {
      ...p,
      pick: () => st.set({ pay: p.id, payStatus: 'idle' }),
      iconStyle: cover(p.c1, p.c2),
      style: `cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;transition:all .2s;background:${sel ? 'rgba(124,131,255,.16)' : 'var(--s-card,#13151d)'};border:1.5px solid ${sel ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
      radioStyle: `width:18px;height:18px;border-radius:50%;flex-shrink:0;border:2px solid ${sel ? 'var(--acc,#4f46e5)' : 'rgba(255,255,255,.22)'};background:${sel ? 'radial-gradient(circle,var(--acc,#4f46e5) 0 40%,transparent 45%)' : 'transparent'};`,
    }
  })
  const curPay = PAYS.find((p) => p.id === s.pay) || PAYS[0]

  const toolCats = ['all', 'FPS', 'MOBA', 'MMORPG', 'Sandbox']
  const toolLabels: Record<string, string> = { all: 'ทั้งหมด', FPS: 'FPS', MOBA: 'MOBA', MMORPG: 'MMORPG', Sandbox: 'Sandbox' }
  const toolFilters = toolCats.map((c) => ({
    label: toolLabels[c], pick: () => st.set({ tool: c }),
    style: `cursor:pointer;padding:9px 18px;border-radius:11px;font-size:13.5px;font-weight:500;transition:all .2s;background:${s.tool === c ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)'};color:${s.tool === c ? '#fff' : 'var(--t2,#9aa1ad)'};border:1.5px solid ${s.tool === c ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
  }))
  const badge = (stx: string) => {
    const m: Record<string, string[]> = { Free: ['rgba(34,197,94,.14)', 'var(--good,#16a34a)'], Pro: ['rgba(124,131,255,.16)', 'var(--acc,#4f46e5)'], New: ['rgba(251,146,60,.14)', '#fb923c'] }
    const c = m[stx] || m.Free
    return `font-size:10.5px;font-weight:600;padding:4px 9px;border-radius:7px;background:${c[0]};color:${c[1]};`
  }
  const tools = TOOLS.filter((t) => s.tool === 'all' || t.cat === s.tool).map((t, i) => {
    const on = !!s.active[t.id]
    const func = (t.id === 't1' || t.id === 't8')
    return {
      ...t, iconStyle: cover(['#6366f1', '#22d3ee', '#34d399', '#fb7185', '#fbbf24'][i % 5], ['#4f46e5', '#0ea5e9', '#16a34a', '#f43f5e', '#f97316'][i % 5]),
      badgeStyle: badge(t.status),
      toggle: func ? () => st.openTool(t.id) : () => st.set((x) => ({ active: { ...x.active, [t.id]: !x.active[t.id] } })),
      btnLabel: func ? 'เปิดเครื่องมือ →' : (on ? 'กำลังใช้งาน ✓' : 'เปิดใช้งาน'),
      btnStyle: `cursor:pointer;padding:8px 16px;border-radius:9px;font-size:12.5px;font-weight:600;transition:all .2s;background:${(on && !func) ? 'rgba(34,197,94,.14)' : 'var(--acc,#4f46e5)'};color:${(on && !func) ? 'var(--good,#16a34a)' : '#fff'};border:1.5px solid ${(on && !func) ? 'rgba(34,197,94,.35)' : 'transparent'};`,
    }
  })
  const featuredTools = TOOLS.slice(0, 4).map((t, i) => ({
    ...t,
    iconStyle: cover(['#6366f1', '#22d3ee', '#34d399', '#fb7185'][i], ['#4f46e5', '#0ea5e9', '#16a34a', '#f43f5e'][i]),
    badgeStyle: badge(t.status),
  }))

  const newsCats = ['all', 'อัปเดต', 'อีสปอร์ต', 'รีวิว', 'โปรโมชั่น', 'ไกด์']
  const newsFilters = newsCats.map((c) => ({
    label: c === 'all' ? 'ทั้งหมด' : c, pick: () => st.set({ news: c }),
    style: `cursor:pointer;padding:9px 18px;border-radius:11px;font-size:13.5px;font-weight:500;transition:all .2s;background:${s.news === c ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)'};color:${s.news === c ? '#fff' : 'var(--t2,#9aa1ad)'};border:1.5px solid ${s.news === c ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
  }))
  const newsAll = NEWS.map((n) => ({ ...n, coverStyle: cover(n.c1, n.c2), slotId: 'img-' + n.id, open: () => st.openArticle(n.id) }))
  const news = newsAll.filter((n) => s.news === 'all' || n.cat === s.news)
  const feature = newsAll[0]
  const homeNews = newsAll.slice(0, 3)
  const articleData = (() => {
    const a = NEWS.find((n) => n.id === s.article) || NEWS[0]
    const more = newsAll.filter((n) => n.id !== a.id).slice(0, 3)
    return { ...a, coverStyle: cover(a.c1, a.c2), slotId: 'img-' + a.id, body: a.body || [a.excerpt], more }
  })()

  const gamePickerFull = GAMES.filter((x) => matchGame(x, q))
  const gamePicker = gamePickerFull.map((x) => {
    const sel = x.id === s.game
    return {
      ...x, coverStyle: cover(x.c1, x.c2), pick: () => st.set({ game: x.id, payStatus: 'idle' }),
      chipStyle: `cursor:pointer;flex-shrink:0;width:108px;text-align:center;padding:14px 8px;border-radius:16px;transition:all .2s;background:${sel ? 'rgba(124,131,255,.16)' : 'var(--s-card,#13151d)'};border:1.5px solid ${sel ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
    }
  })

  const fee = curPay.id === 'crypto' ? 0 : (curPay.id === 'card' ? 15 : 5)
  const subtotal = cur.price + fee
  let discount = 0
  if (s.coupon) discount += s.coupon.type === 'pct' ? Math.round(cur.price * s.coupon.value / 100) : s.coupon.value
  const creditUsed = Math.min(s.redeemCredit, subtotal - discount)
  const grandTotal = Math.max(0, subtotal - discount - creditUsed)

  // ---- flash sale ----
  const msLeft = Math.max(0, (s.saleEnd || (s.now + 12780000)) - s.now)
  const pad = (n: number) => String(n).padStart(2, '0')
  const saleHH = pad(Math.floor(msLeft / 3600000))
  const saleMM = pad(Math.floor((msLeft % 3600000) / 60000))
  const saleSS = pad(Math.floor((msLeft % 60000) / 1000))
  const flashDeals = FLASH_DEALS.map((d, i) => {
    const fg = GAMES.find((x) => x.id === d.gid) || GAMES[0]
    const fp = PKGS.find((p) => p.id === d.pkgId) || PKGS[0]
    const salePrice = Math.round(fp.price * (100 - d.off) / 100)
    return {
      key: 'fd' + i, name: fg.name, short: fg.short, coverStyle: cover(fg.c1, fg.c2),
      amount: fp.amount, currency: fg.currency, off: d.off, oldPrice: fp.price, salePrice,
      buy: () => setGo({ game: d.gid, pkg: d.pkgId, route: 'topup', couponInput: 'FLASH20', payStatus: 'idle' }),
    }
  })

  // ---- personalization ----
  const favGames = games.filter((x) => s.favorites[x.id])
  const recentSrc = st.orders().slice(0, 4)
  const recentOrders = recentSrc.map((o, i) => {
    const og = GAMES.find((x) => x.id === o.gid) || GAMES[0]
    const op = PKGS.find((p) => p.id === o.pkg) || PKGS[0]
    return {
      key: 'ro' + i + o.ref, short: og.short, name: og.name, coverStyle: cover(og.c1, og.c2),
      sub: op.amount + ' ' + og.currency, reorder: () => st.reorder(o.gid, o.pkg),
    }
  })
  const hasPersonal = favGames.length > 0 || recentOrders.length > 0

  const reviews = REVIEWS.map((r) => ({
    ...r,
    full: '★'.repeat(r.rating), empty: '★'.repeat(5 - r.rating),
    initial: r.name.charAt(0), avStyle: cover(r.c1, r.c2),
  }))

  const promoTicker = [
    { text: '🎁 สมาชิกใหม่รับโบนัส 10% ทุกการเติม · ใช้โค้ด WELCOME10' },
    { text: '💎 จ่ายด้วย Crypto (USDT) รับส่วนลดเพิ่มอีก 5%' },
    { text: '🔥 RoV ลดสูงสุด 30% เฉพาะสัปดาห์นี้' },
    { text: '⚡ เติมเข้าบัญชีเกมอัตโนมัติภายในไม่กี่วินาที' },
    { text: '👑 สมาชิก VIP รับแต้มสะสมทุกการเติม แลกของรางวัลได้' },
    { text: '📰 ข่าวใหม่: อัปเดตแพ็กเกจ Free Fire & Valorant แล้ววันนี้' },
  ]
  const tk = TICKER[s.tickerIdx % TICKER.length]
  const ticker = { key: 'tk' + s.tickerIdx, text: `${tk.who} เพิ่งเติม ${tk.g} ${tk.a} · ${tk.t}` }

  const promoIdx = s.promoIdx % PROMOS.length
  const pr = PROMOS[promoIdx]
  const pg = GAMES.find((x) => x.id === pr.gid) || GAMES[0]
  const pp = PKGS.find((p) => p.id === pr.pkgId) || PKGS[0]
  const promo = {
    key: 'pr' + promoIdx,
    short: pg.short, name: pg.name, off: pr.off, badge: pr.badge, code: pr.code,
    headline: pr.headline, sub: pr.sub,
    amount: pp.amount, currency: pg.currency,
    salePrice: Math.round(pp.price * (100 - pr.off) / 100), oldPrice: pp.price,
    bgStyle: `background:linear-gradient(140deg, ${pg.c1}, ${pg.c2});`,
    buy: () => setGo({ game: pr.gid, pkg: pr.pkgId, route: 'topup', couponInput: pr.code, payStatus: 'idle' }),
  }
  const promoDots = PROMOS.map((_, i) => ({
    key: 'pd' + i,
    go: () => st.set({ promoIdx: i }),
    style: i === promoIdx
      ? 'width:22px;height:7px;border-radius:99px;background:#fff;cursor:pointer;transition:all .3s;'
      : 'width:7px;height:7px;border-radius:99px;background:rgba(255,255,255,.45);cursor:pointer;transition:all .3s;',
  }))

  // order status steps
  const ps = s.payStatus
  const stepDot = (state: string) => {
    if (state === 'done') return `width:22px;height:22px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;color:#fff;background:var(--good,#16a34a);`
    if (state === 'active') return `width:22px;height:22px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;color:#fff;background:var(--acc,#4f46e5);`
    return `width:22px;height:22px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;font-size:11px;color:rgba(255,255,255,.22);background:var(--bd-soft,rgba(255,255,255,.06));`
  }
  const mk = (state: string, label: string) => ({
    dotStyle: stepDot(state), mark: state === 'done' ? '✓' : (state === 'active' ? '•' : '○'),
    label, weight: state === 'pending' ? 400 : 600,
    color: state === 'pending' ? 'var(--t3b,#6c727e)' : (state === 'active' ? 'var(--acc,#4f46e5)' : 'var(--ok,#4ade80)'),
  })
  const orderSteps = [
    mk('done', 'รับคำสั่งซื้อแล้ว'),
    mk(ps === 'awaiting' ? 'active' : 'done', ps === 'awaiting' ? 'รอรับยอดเงิน...' : 'ได้รับยอดเงินแล้ว'),
    mk(ps === 'success' ? 'done' : (ps === 'processing' ? 'active' : 'pending'), ps === 'success' ? 'เติมเข้าบัญชีสำเร็จ ✓' : (ps === 'processing' ? 'กำลังเติมเข้าบัญชี...' : 'รอเติมเข้าบัญชี')),
  ]

  // ---- payment panel (QR / method-specific) ----
  const payRef = s.payRef || ''
  const qrN = 25
  const seedStr = payRef + curPay.id + grandTotal
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619) }
  const rand = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000 }
  const isFinder = (r: number, c: number) => { const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7; return inBox(0, 0) || inBox(0, qrN - 7) || inBox(qrN - 7, 0) }
  const finderOn = (r: number, c: number) => { const f = (br: number, bc: number) => { const lr = r - br, lc = c - bc; if (lr < 0 || lc < 0 || lr > 6 || lc > 6) return false; if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true; if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true; return false }; return f(0, 0) || f(0, qrN - 7) || f(qrN - 7, 0) }
  const qrCells: number[] = []
  for (let r = 0; r < qrN; r++) for (let c = 0; c < qrN; c++) {
    const on = isFinder(r, c) ? finderOn(r, c) : rand() > 0.52
    if (on) qrCells.push(r * qrN + c)
  }
  const payQrEl = (
    <div style={{ width: '188px', height: '188px', background: '#fff', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: `repeat(${qrN},1fr)`, gridTemplateRows: `repeat(${qrN},1fr)`, gap: 0, boxShadow: '0 8px 24px -8px rgba(0,0,0,.4)' }}>
      {qrCells.map((i) => (
        <div key={i} style={{ gridColumnStart: (i % qrN) + 1, gridRowStart: Math.floor(i / qrN) + 1, background: '#0a0912', borderRadius: '1px' }} />
      ))}
    </div>
  )
  const payWallet = '0x7Fa9' + (payRef.slice(-4) || '3C21') + '...aE9d'
  const payInfo: Record<string, { title: string; sub: string; showQr: boolean; showWallet: boolean }> = {
    promptpay: { title: 'สแกนจ่ายผ่าน PromptPay', sub: 'เปิดแอปธนาคาร → สแกน QR → ยืนยันยอด', showQr: true, showWallet: false },
    truemoney: { title: 'สแกนจ่ายผ่าน TrueMoney', sub: 'เปิดแอป TrueMoney Wallet → สแกน QR', showQr: true, showWallet: false },
    crypto: { title: 'โอน USDT (TRC-20)', sub: 'สแกน QR หรือคัดลอกที่อยู่กระเป๋าด้านล่าง', showQr: true, showWallet: true },
    card: { title: 'ชำระผ่านบัตรเครดิต', sub: 'สแกนเพื่อยืนยัน 3-D Secure บนมือถือ', showQr: true, showWallet: false },
  }
  const payPanelInfo = payInfo[curPay.id] || payInfo.promptpay
  const payPanel = {
    title: payPanelInfo.title, sub: payPanelInfo.sub,
    showQr: payPanelInfo.showQr, showWallet: payPanelInfo.showWallet,
    wallet: payWallet, amount: '฿' + grandTotal, ref: '#' + payRef,
    iconStyle: cover(curPay.c1, curPay.c2), code: curPay.code, name: curPay.name,
    copyWallet: () => { try { navigator.clipboard.writeText(payWallet) } catch { /* */ } st.showToast('คัดลอกที่อยู่กระเป๋าแล้ว', '📋') },
  }

  // history orders
  const statusMap: Record<string, { label: string; style: string }> = {
    success: { label: 'สำเร็จ', style: 'font-size:11.5px;font-weight:600;padding:6px 12px;border-radius:8px;background:rgba(34,197,94,.14);color:var(--ok,#4ade80);' },
    pending: { label: 'กำลังดำเนินการ', style: 'font-size:11.5px;font-weight:600;padding:6px 12px;border-radius:8px;background:rgba(251,146,60,.13);color:#fb923c;' },
    failed: { label: 'ไม่สำเร็จ', style: 'font-size:11.5px;font-weight:600;padding:6px 12px;border-radius:8px;background:rgba(248,113,113,.12);color:#f87171;' },
  }
  const orders = st.orders().map((o, i) => {
    const og = GAMES.find((x) => x.id === o.gid) || GAMES[0]
    const op = PKGS.find((p) => p.id === o.pkg) || PKGS[0]
    const stt = statusMap[o.status] || statusMap.success
    return {
      key: 'o' + i + o.ref, short: og.short, name: og.name, currency: og.currency, coverStyle: cover(og.c1, og.c2),
      amount: op.amount, price: op.price, time: o.time, ref: o.ref, statusLabel: stt.label, badgeStyle: stt.style,
      reorder: () => st.reorder(o.gid, o.pkg),
    }
  })
  const totalSpent = st.orders().filter((o) => o.status === 'success').reduce((a, o) => {
    const op = PKGS.find((p) => p.id === o.pkg) || PKGS[0]; return a + op.price
  }, 0)
  // Points: server-authoritative when logged in, demo formula for guests.
  const pointsBal = s.points != null ? s.points : (1250 + s.checkedDays * 20 - s.redeemedPts)
  const acctStats = [
    { label: 'ยอดเติมสะสม', value: '฿' + totalSpent.toLocaleString(), color: 'var(--t1,#eef0f5)' },
    { label: 'จำนวนรายการ', value: String(st.orders().length), color: 'var(--t1,#eef0f5)' },
    { label: 'แต้มสะสม', value: pointsBal.toLocaleString(), color: 'var(--acc,#4f46e5)' },
  ]

  // ---- membership tier ----
  const tiers = [
    { key: 'Bronze', min: 0, disc: 0, c: '#cd7f32' },
    { key: 'Silver', min: 300, disc: 2, c: '#9ca3af' },
    { key: 'Gold', min: 1000, disc: 5, c: '#fbbf24' },
    { key: 'Diamond', min: 3000, disc: 8, c: '#22d3ee' },
  ]
  let tierIdx = 0
  tiers.forEach((t, i) => { if (totalSpent >= t.min) tierIdx = i })
  const tier = tiers[tierIdx]
  const nextTier = tiers[tierIdx + 1] || null
  const tierProgress = nextTier ? Math.min(100, Math.round((totalSpent - tier.min) / (nextTier.min - tier.min) * 100)) : 100
  const tierNeed = nextTier ? (nextTier.min - totalSpent) : 0

  // ---- points / redeem ----
  const redeemOpts = [
    { cost: 500, credit: 50, label: 'เครดิต ฿50' },
    { cost: 1000, credit: 120, label: 'เครดิต ฿120' },
    { cost: 2000, credit: 280, label: 'เครดิต ฿280' },
  ].map((o) => ({
    ...o, can: pointsBal >= o.cost, redeem: () => st.redeemPoints(o.cost, o.credit),
    style: `cursor:${pointsBal >= o.cost ? 'pointer' : 'not-allowed'};opacity:${pointsBal >= o.cost ? 1 : .45};padding:16px;border-radius:14px;background:var(--s-inset,#161922);border:1.5px solid var(--bd,rgba(255,255,255,.1));text-align:center;transition:all .2s;`,
  }))

  // ---- check-in ----
  const checkDays = [1, 2, 3, 4, 5, 6, 7].map((d) => {
    const done = d <= s.checkedDays
    const isToday = d === s.checkedDays + 1 && !s.claimedToday
    return {
      key: 'cd' + d, label: 'วัน ' + d, reward: d === 7 ? '+100' : '+20',
      style: `flex:1;min-width:70px;padding:12px 6px;border-radius:12px;text-align:center;border:1.5px solid ${done ? 'var(--good,#16a34a)' : (isToday ? 'var(--acc,#4f46e5)' : 'var(--bd,rgba(255,255,255,.1))')};background:${done ? 'rgba(34,197,94,.12)' : (isToday ? 'rgba(124,131,255,.14)' : 'var(--s-inset,#161922)')};`,
      mark: done ? '✓' : (d === 7 ? '🎁' : '⭐'),
      markColor: done ? 'var(--good,#16a34a)' : (isToday ? 'var(--acc,#4f46e5)' : 'var(--t3b,#6c727e)'),
    }
  })

  const refCode = 'GVG-PROGAMER88'

  // ---- order lookup ----
  const lookupResult = (() => {
    if (!s.lookupDone) return null
    const ref = (s.lookupRef || '').trim().toUpperCase().replace(/^#/, '')
    const found = st.orders().find((o) => o.ref.toUpperCase().replace(/^#/, '') === ref || o.ref.toUpperCase().includes(ref))
    if (!ref) return null
    if (!found) return { ok: false } as const
    const og = GAMES.find((x) => x.id === found.gid) || GAMES[0]
    const op = PKGS.find((p) => p.id === found.pkg) || PKGS[0]
    const stMap: Record<string, string> = { success: 'สำเร็จ ✓', pending: 'กำลังดำเนินการ', failed: 'ไม่สำเร็จ' }
    const stColor: Record<string, string> = { success: 'var(--ok,#4ade80)', pending: '#fb923c', failed: '#f87171' }
    return {
      ok: true, name: og.name, short: og.short, coverStyle: cover(og.c1, og.c2),
      amount: op.amount, currency: og.currency, ref: found.ref, time: found.time,
      statusLabel: stMap[found.status], statusColor: stColor[found.status],
    } as const
  })()

  // ---- search autocomplete ----
  const suggestSource = q ? games.filter((x) => matchGame(x, q)) : [...games].sort((a, b) => b.daily - a.daily)
  const suggestList = suggestSource.slice(0, 6).map((x) => ({
    key: 'sg-' + x.id, name: x.name, genre: x.genre, short: x.short, coverStyle: x.coverStyle,
    fromLabel: '฿' + x.from, hot: x.hot,
    pick: () => { st.openGame(x.id); st.set({ searchFocus: false, q: '' }) },
  }))
  const showSuggest = !!s.searchFocus && suggestList.length > 0
  const showSuggestNav = s.searchFocus === 'nav' && suggestList.length > 0
  const showSuggestHero = s.searchFocus === 'hero' && suggestList.length > 0
  const showSuggestCatalog = s.searchFocus === 'catalog' && suggestList.length > 0
  const suggestHeader = q ? `ผลการค้นหา · ${suggestSource.length} เกม` : '🔥 ค้นหายอดนิยม'

  // ---- catalog ----
  const catDefs = [
    { key: 'all', label: 'ทั้งหมด' }, { key: 'moba', label: 'MOBA' }, { key: 'fps', label: 'FPS' },
    { key: 'br', label: 'Battle Royale' }, { key: 'rpg', label: 'เกม RPG' }, { key: 'other', label: 'แซนด์บ็อกซ์/อื่นๆ' }, { key: 'platform', label: 'บัตร & แพลตฟอร์ม' },
  ]
  const catCount = (k: string) => games.filter((x) => (k === 'all' || x.cat === k)).length
  const categoryTabs = catDefs.map((c) => {
    const on = s.catCat === c.key
    return {
      label: `${c.label} (${catCount(c.key)})`, pick: () => st.set({ catCat: c.key }),
      style: `cursor:pointer;padding:9px 16px;border-radius:11px;font-size:13.5px;font-weight:${on ? 600 : 500};transition:all .2s;white-space:nowrap;background:${on ? 'var(--acc,#4f46e5)' : 'var(--s-card,#13151d)'};color:${on ? '#fff' : 'var(--t2,#9aa1ad)'};border:1.5px solid ${on ? 'var(--acc,#4f46e5)' : 'var(--bd,rgba(255,255,255,.09))'};`,
    }
  })
  const platDefs = [{ key: 'all', label: 'ทุกแพลตฟอร์ม' }, { key: 'mobile', label: '📱 มือถือ' }, { key: 'pc', label: '💻 PC' }, { key: 'platform', label: '🎟️ บัตร' }]
  const platformChips = platDefs.map((p) => {
    const on = s.catPlatform === p.key
    return {
      label: p.label, pick: () => st.set({ catPlatform: p.key }),
      style: `cursor:pointer;padding:8px 14px;border-radius:10px;font-size:12.5px;font-weight:500;transition:all .2s;white-space:nowrap;background:${on ? 'rgba(124,131,255,.16)' : 'transparent'};color:${on ? 'var(--acc,#4f46e5)' : 'var(--t3,#878e9a)'};border:1.5px solid ${on ? 'var(--acc,#4f46e5)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
    }
  })
  const sortDefs = [{ key: 'popular', label: 'ยอดนิยม' }, { key: 'priceLow', label: 'ราคาถูกสุด' }, { key: 'newest', label: 'มาใหม่' }]
  const sortPills = sortDefs.map((p) => {
    const on = s.catSort === p.key
    return {
      label: p.label, pick: () => st.set({ catSort: p.key }),
      style: `cursor:pointer;padding:8px 14px;border-radius:10px;font-size:12.5px;font-weight:${on ? 600 : 500};transition:all .2s;white-space:nowrap;background:${on ? 'var(--s-input,#181b24)' : 'transparent'};color:${on ? 'var(--t1,#eef0f5)' : 'var(--t3,#878e9a)'};border:1.5px solid ${on ? 'rgba(255,255,255,.18)' : 'var(--bd2,rgba(255,255,255,.12))'};`,
    }
  })
  let catalogGames = games.filter((x) => matchGame(x, q) && (s.catCat === 'all' || x.cat === s.catCat) && platMatch(x, s.catPlatform))
  if (s.catSort === 'priceLow') catalogGames = [...catalogGames].sort((a, b) => a.from - b.from)
  else if (s.catSort === 'newest') catalogGames = [...catalogGames].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.daily - a.daily)
  else catalogGames = [...catalogGames].sort((a, b) => b.daily - a.daily)
  const catalogGamesV = catalogGames.map((x) => ({ ...posterOf[x.id], newBadge: x.isNew }))

  // ---- tool modal computations ----
  const toolModalData = (() => {
    if (!s.toolModal) return null
    if (s.toolModal === 't1') {
      const sens = parseFloat(s.tSens) || 0
      const dpi = parseFloat(s.tDpi) || 0
      const edpi = Math.round(sens * dpi)
      const cm360 = sens > 0 && dpi > 0 ? ((2.54 * 360) / (dpi * sens * 0.07)).toFixed(1) : '—'
      const valoConv = dpi > 0 ? (edpi / 800).toFixed(3) : '—'
      return { id: 't1', title: 'Sensitivity Converter', edpi, cm360, valoConv }
    }
    if (s.toolModal === 't8') {
      const budget = parseFloat(s.tBudget) || 0
      const perPull = 35
      const pulls = Math.floor(budget / perPull)
      const pAtLeast = pulls > 0 ? (1 - Math.pow(1 - 0.006, pulls)) : 0
      const pPct = (pAtLeast * 100).toFixed(1)
      const expected = (pulls / 90).toFixed(2)
      const guaranteed = pulls >= 90 ? 'ใช่ (ถึงเพดาน 90 ครั้ง)' : 'ยังไม่ถึงเพดาน'
      return { id: 't8', title: 'Gacha Simulator', pulls, pPct, expected, guaranteed }
    }
    return null
  })() as any

  const trustBadges = [
    { icon: '⚡', label: 'เติมอัตโนมัติ 5 วินาที' },
    { icon: '🛡️', label: 'การันตีคืนเงิน 100%' },
    { icon: '🔒', label: 'ปลอดภัย SSL' },
    { icon: '★', label: '4.9 จาก 12,400+ รีวิว' },
    { icon: '💬', label: 'ซัพพอร์ต 24 ชม.' },
  ]
  const footCols = [
    { title: 'บริการ', links: ['เติมเกม', 'Tools ช่วยเล่น', 'ข่าวสาร', 'โปรโมชั่น'] },
    { title: 'ช่วยเหลือ', links: ['วิธีเติมเกม', 'คำถามที่พบบ่อย', 'ติดต่อทีมงาน', 'แจ้งปัญหา'] },
    { title: 'ติดตามเรา', links: ['Discord', 'Facebook', 'TikTok', 'YouTube'] },
  ]

  // ---------- chat ----------
  const chatStat: Record<string, { l: string; c: string }> = { success: { l: 'สำเร็จ', c: 'var(--ok,#4ade80)' }, pending: { l: 'กำลังดำเนินการ', c: '#fbbf24' }, failed: { l: 'ไม่สำเร็จ', c: '#fb7185' } }
  const buildOrderCard = (o: any) => {
    const og = GAMES.find((x) => x.id === o.gid) || GAMES[0]
    const op = PKGS.find((p) => p.id === o.pkg) || PKGS[0]
    const stt = chatStat[o.status] || chatStat.pending
    return {
      coverStyle: cover(og.c1, og.c2), short: og.short, name: og.name, pkgLabel: op.amount + ' ' + og.currency, ref: o.ref, time: o.time, statusLabel: stt.l,
      statusStyle: `display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:7px;font-size:11px;font-weight:600;background:${stt.c}22;color:${stt.c};`,
      go: () => { st.go('history'); st.set({ chatOpen: false }) },
      reorder: () => { st.reorder(o.gid, o.pkg); st.set({ chatOpen: false }) },
    }
  }
  const chatMessages = s.chatLog.map((m) => {
    const isBot = m.role === 'bot'
    const row: any = {
      id: m.id, isBot, time: m.time, avatarShow: isBot,
      isText: m.kind === 'text', isImage: m.kind === 'image', isOrder: m.kind === 'order', isCards: m.kind === 'cards',
      text: m.text || '', img: m.img || '', hasCaption: !!(m.kind === 'image' && m.text),
      rowStyle: `display:flex;gap:9px;align-items:flex-end;margin-bottom:14px;flex-direction:${isBot ? 'row' : 'row-reverse'};`,
      colStyle: `display:flex;flex-direction:column;max-width:80%;align-items:${isBot ? 'flex-start' : 'flex-end'};`,
      bubbleStyle: isBot
        ? 'backdrop-filter:blur(15px) saturate(1.4);-webkit-backdrop-filter:blur(15px) saturate(1.4);background:var(--s-input,#181b24);border:1px solid var(--bd,rgba(255,255,255,.08));color:var(--t1,#e7e9f0);padding:10px 13px;border-radius:14px 14px 14px 4px;font-size:13.5px;line-height:1.55;'
        : 'background:linear-gradient(135deg,var(--acc,#4f46e5),var(--acc2,#7c83ff));color:#fff;padding:10px 13px;border-radius:14px 14px 4px 14px;font-size:13.5px;line-height:1.55;',
      timeStyle: `font-size:10px;color:var(--t3b,#5a6170);margin-top:4px;padding:0 4px;`,
    }
    if (m.kind === 'order') row.order = buildOrderCard(m.order)
    if (m.kind === 'cards') row.cardList = (m.cards || []).map((gid: string) => { const gg = GAMES.find((x) => x.id === gid) || GAMES[0]; return { coverStyle: cover(gg.c1, gg.c2), short: gg.short, name: gg.name, fromLabel: '฿' + gg.from, go: () => { st.reorder(gid, 'p3'); st.set({ chatOpen: false }) } } })
    return row
  })
  const chatQuick = [
    { label: '⚡ วิธีเติมเกม', q: 'วิธีเติมเกมยังไง' },
    { label: '📋 แนบออเดอร์ล่าสุด', order: true },
    { label: '🔍 เช็คสถานะออเดอร์', q: 'เช็คสถานะออเดอร์' },
    { label: '🎁 โค้ดส่วนลด', q: 'มีโค้ดส่วนลดไหม' },
    { label: '💳 ช่องทางชำระเงิน', q: 'จ่ายเงินยังไงได้บ้าง' },
  ].map((d) => ({ label: d.label, send: d.order ? (() => st.attachOrder()) : (() => st.sendQuick(d.q!)) }))

  return {
    isHome: s.route === 'home', isTopup: s.route === 'topup', isTools: s.route === 'tools', isNews: s.route === 'news', isDetail: s.route === 'detail', isHistory: s.route === 'history', isCatalog: s.route === 'catalog', isArticle: s.route === 'article',
    route: s.route,
    goHome: () => st.go('home'), goTopup: () => st.go('topup'), goTools: () => st.go('tools'), goNews: () => st.go('news'), goHistory: () => st.go('history'), goCatalog: () => st.go('catalog'),
    showWallet: true,
    nav, bottomNav, games, marquee, homeGames, heroPkgs, pkgs, related, pays, tools, featuredTools, toolFilters, news, newsFilters, feature, homeNews, gamePicker, footCols, reviews, ticker, promo, promoDots, promoTicker, priceCount, priceEmpty, boardRows, boardDotsEls, boardMultetPage, priceUpdated, priceDrops, trustBadges, orders, acctStats, orderSteps,
    suggestList, showSuggest, showSuggestNav, showSuggestHero, showSuggestCatalog, suggestHeader,
    focusNav: () => { st.set({ searchFocus: 'nav' }) },
    focusHero: () => { st.set({ searchFocus: 'hero' }) },
    focusCatalog: () => { st.set({ searchFocus: 'catalog' }) },
    blurSearch: () => { setTimeout(() => st.set({ searchFocus: false }), 160) },
    categoryTabs, platformChips, sortPills, catalogGames: catalogGamesV, catalogCount: catalogGamesV.length,
    catalogNoResult: catalogGamesV.length === 0,
    heroSlide, heroDots, heroPrev, heroNext,
    heroMove: (e: any) => { const t = e.currentTarget; const r = t.getBoundingClientRect(); t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); t.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%') },
    liveCount: s.liveCount.toLocaleString(),
    toast: s.toast, hasToast: !!s.toast, toastMsg: s.toast ? s.toast.msg : '', toastIcon: s.toast ? s.toast.icon : '', toastKey: s.toast ? s.toast.k : 0,
    rankedPosters, newPosters, mobaPosters, rpgPosters, searchPosters, allPosters, genreChips,
    hasNew: newPosters.length > 0, hasMoba: mobaPosters.length > 0, hasRpg: rpgPosters.length > 0,
    browseMode: q.length === 0, searchCount: searchPosters.length,
    g, total: cur.price, fee, grandTotal,
    subtotal, discount, creditUsed, hasDiscount: discount > 0, hasCredit: creditUsed > 0,
    coupon: s.coupon, noCoupon: !s.coupon, couponLabel: s.coupon ? s.coupon.label : '', couponCode: s.coupon ? s.coupon.code : '',
    couponInput: s.couponInput, couponError: s.couponError,
    setCoupon: (e: any) => st.set({ couponInput: e.target.value, couponError: '' }),
    applyCoupon: () => st.applyCoupon(), removeCoupon: () => st.removeCoupon(),
    flashDeals, saleHH, saleMM, saleSS,
    favGames, recentOrders, hasPersonal, hasFav: favGames.length > 0, hasRecent: recentOrders.length > 0,
    tier, tierColor: tier.c, tierLabel: tier.key, tierDisc: tier.disc,
    nextTierLabel: nextTier ? nextTier.key : '', tierIsMax: !nextTier, showNextTier: !!nextTier, tierProgress, tierNeed: tierNeed.toLocaleString(),
    tierBarStyle: `height:100%;width:${tierProgress}%;background:linear-gradient(90deg,${tier.c},var(--acc2,#7c83ff));border-radius:99px;transition:width .4s;`,
    tierBadgeStyle: `display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:99px;background:${tier.c}22;border:1px solid ${tier.c};color:${tier.c};font-weight:700;font-size:13px;`,
    pointsBal: pointsBal.toLocaleString(), redeemOpts, redeemCredit: s.redeemCredit, hasRedeemCredit: s.redeemCredit > 0,
    checkDays, claimedToday: s.claimedToday, claimCheckin: () => st.claimCheckin(),
    checkinBtnLabel: s.claimedToday ? 'เช็คอินวันนี้แล้ว ✓' : 'เช็คอินรับ +20 แต้ม',
    checkinBtnStyle: `cursor:${s.claimedToday ? 'default' : 'pointer'};height:46px;padding:0 24px;display:inline-grid;place-items:center;border-radius:12px;font-weight:600;font-size:14px;background:${s.claimedToday ? 'var(--s-inset,#161922)' : 'var(--acc,#4f46e5)'};color:${s.claimedToday ? 'var(--t3b,#6c727e)' : '#fff'};border:1px solid ${s.claimedToday ? 'var(--bd,rgba(255,255,255,.1))' : 'transparent'};`,
    refCode, refCopied: s.refCopied, copyRef: () => st.copyRef(refCode), copyLabel: s.refCopied ? 'คัดลอกแล้ว ✓' : 'คัดลอก',
    lookupRef: s.lookupRef, setLookup: (e: any) => st.set({ lookupRef: e.target.value, lookupDone: false }),
    doLookup: () => st.doLookup(), lookupResult,
    lookupFound: !!(lookupResult && (lookupResult as any).ok), lookupMissing: !!(lookupResult && !(lookupResult as any).ok),
    loggedIn: s.loggedIn, notLoggedIn: !s.loggedIn, showLogin: s.showLogin,
    openLogin: () => st.set({ showLogin: true }), closeLogin: () => st.set({ showLogin: false, authError: '' }),
    avatarClick: () => { if (st.loggedIn) st.go('history'); else st.set({ showLogin: true }) },
    // membership
    user: s.user, isMember: !!s.user,
    userEmailLabel: s.user ? (s.user.email.startsWith('line:') ? 'เข้าสู่ระบบผ่าน LINE 🟢' : s.user.email) : '',
    avatarLabel: s.user ? ((s.user.name || s.user.email).trim().slice(0, 2).toUpperCase()) : 'PG',
    walletLabel: s.user ? '฿' + s.redeemCredit.toLocaleString() + '.00' : '฿0.00',
    walletSub: s.user ? 'เครดิตของฉัน' : 'ยอดเงิน',
    doLogout: () => st.logout(),
    isArticleRoute: s.route === 'article', article: articleData,
    toolModalData, closeTool: () => st.closeTool(),
    isSensTool: toolModalData && toolModalData.id === 't1',
    isGachaTool: toolModalData && toolModalData.id === 't8',
    shareBtns: ['Facebook', 'X', 'LINE', 'คัดลอกลิงก์'],
    tSens: s.tSens, tDpi: s.tDpi, tBudget: s.tBudget,
    setSens: (e: any) => st.set({ tSens: e.target.value }), setDpi: (e: any) => st.set({ tDpi: e.target.value }),
    setBudget: (e: any) => st.set({ tBudget: e.target.value }),
    q: s.q, hasQuery: q.length > 0,
    popularTitle: q ? `ผลการค้นหา "${q}"` : 'เกมยอดนิยม',
    homeNoResult: q.length > 0 && homeGames.length === 0,
    pickerNoResult: q.length > 0 && gamePickerFull.length === 0,
    setQ: (e: any) => st.set({ q: e.target.value }),
    clearQ: () => st.set({ q: '' }),
    selAmount: cur.amount, selBonus: cur.bonus ? `+${cur.bonus}` : '—',
    playerId: s.playerId, serverId: s.serverId,
    playerIdShown: s.playerId || '—',
    payName: curPay.name,
    payIdle: ps === 'idle', payActive: ps !== 'idle',
    payAwaiting: ps === 'awaiting', payProcessing: ps === 'processing' || ps === 'success',
    payBtnLabel: 'ยืนยันการชำระเงิน · ฿' + grandTotal,
    payPanel, payQrEl,
    receivePayment: () => st.receivePayment(),
    cancelPay: () => st.cancelPay(),
    setPlayerId: (e: any) => st.set({ playerId: e.target.value }),
    setServerId: (e: any) => st.set({ serverId: e.target.value }),
    pay: () => st.doPay(),
    noop: () => {},
    isDay: s.theme === 'day',
    isNight: s.theme !== 'day',
    toggleTheme: () => st.toggleTheme(),
    themeLabel: s.theme === 'day' ? 'Night' : 'Day',
    chatOpen: s.chatOpen, chatClosed: !s.chatOpen, chatTyping: s.chatTyping,
    chatStatusText: s.chatTyping ? 'กำลังพิมพ์…' : 'ออนไลน์ · ตอบไวภายในไม่กี่วินาที',
    chatMessages, chatQuick, chatInput: s.chatInput,
    setChatInput: (e: any) => st.set({ chatInput: e.target.value }),
    sendChat: () => st.sendChatText(),
    chatKey: (e: any) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); st.sendChatText() } },
    toggleChat: () => st.toggleChat(),
    pickImage: (e: any) => st.pickImageFile(e.target.files && e.target.files[0]),
    chatPendingImg: s.chatPendingImg, hasPendingImg: !!s.chatPendingImg,
    clearPendingImg: () => st.set({ chatPendingImg: null }),
    chatUnread: s.chatUnread, hasUnread: s.chatUnread > 0,
    stats: [{ value: '฿24M+', label: 'ยอดเติมสะสม' }, { value: '180K+', label: 'ผู้เล่นที่ไว้ใจ' }, { value: '12,840', label: 'เติมสำเร็จวันนี้' }],
  }
}

export type Vals = ReturnType<typeof computeVals>
