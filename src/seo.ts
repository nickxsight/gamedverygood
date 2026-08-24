// Per-page <title> / meta description / canonical, kept in sync as the
// visitor navigates. (What crawlers see on first paint is injected
// server-side by the Worker; this keeps the tags honest after that.)
import { mergedGames, NEWS } from './data'
import type { State } from './store'
import { pathFor } from './router'

const SITE = 'gamedverygood'
const DEFAULT_TITLE = 'gamedverygood — เติมเกม ข่าวสาร Tools ครบวงจร'
const DEFAULT_DESC = 'แพลตฟอร์มเติมเกม ข่าวสาร และ Tools ครบวงจร — เร็ว ปลอดภัย เชื่อถือได้'

const LEGAL_TITLES: Record<string, string> = {
  terms: 'ข้อกำหนดการใช้งาน', privacy: 'นโยบายความเป็นส่วนตัว', refund: 'นโยบายการคืนเงินและการยกเลิก',
}

export function headFor(s: State): { title: string; desc: string } {
  const games = mergedGames(s.customGames, s.hiddenGames)
  switch (s.route) {
    case 'catalog':
      return {
        title: `รวมเกมทั้งหมด — เติมเกมออนไลน์ราคาถูก | ${SITE}`,
        desc: `เลือกเติมเกมยอดนิยม ${games.length} เกม จ่ายผ่าน PromptPay TrueMoney บัตรเครดิต เข้าไวปลอดภัย`,
      }
    case 'detail':
    case 'topup': {
      const g = games.find((x) => x.id === s.game)
      if (!g) return { title: DEFAULT_TITLE, desc: DEFAULT_DESC }
      return { title: `เติมเกม ${g.name} (${g.currency}) เริ่มต้น ฿${g.from} | ${SITE}`, desc: g.desc || DEFAULT_DESC }
    }
    case 'news':
      return { title: `ข่าวเกม โปรโมชั่น และไกด์ล่าสุด | ${SITE}`, desc: 'อัปเดตข่าวสารวงการเกม โปรโมชั่นเติมเกม อีสปอร์ต และไกด์เทคนิคการเล่น อ่านฟรีทุกวัน' }
    case 'article': {
      const src: Array<{ id: string; title: string; excerpt: string }> = (s.articles && s.articles.length) ? s.articles : NEWS
      const a = src.find((n) => n.id === s.article)
      if (!a) return { title: `ข่าวเกม โปรโมชั่น และไกด์ล่าสุด | ${SITE}`, desc: DEFAULT_DESC }
      return { title: `${a.title} | ${SITE}`, desc: a.excerpt || DEFAULT_DESC }
    }
    case 'tools':
      return { title: `Gamer Tools — เครื่องมือสำหรับเกมเมอร์ | ${SITE}`, desc: 'รวมเครื่องมือช่วยเล่นเกม เช่น Sensitivity Converter, Rank Tracker และ Build Optimizer ใช้ฟรี' }
    case 'history':
      return { title: `บัญชีของฉันและประวัติการเติม | ${SITE}`, desc: 'ตรวจสอบประวัติการเติมเกม แต้มสะสม เช็คอินรายวัน และโค้ดชวนเพื่อนของคุณ' }
    case 'legal':
      return { title: `${LEGAL_TITLES[s.legalDoc] || LEGAL_TITLES.terms} | ${SITE}`, desc: `เอกสารนโยบายการให้บริการของ ${SITE}` }
    case 'admin':
      return { title: `หลังบ้าน | ${SITE}`, desc: DEFAULT_DESC }
    default:
      return { title: DEFAULT_TITLE, desc: DEFAULT_DESC }
  }
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function applyHead(s: State) {
  const { title, desc } = headFor(s)
  // The topup flow duplicates the game page's content — canonicalize it there.
  const path = s.route === 'topup' && /^[A-Za-z0-9_-]{1,40}$/.test(s.game) ? `/game/${s.game}` : pathFor(s)
  const href = window.location.origin + path
  document.title = title
  setMeta('name', 'description', desc)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:url', href)
  let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canon) {
    canon = document.createElement('link')
    canon.rel = 'canonical'
    document.head.appendChild(canon)
  }
  canon.href = href
}
