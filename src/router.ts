// URL ↔ store sync (History API). Navigation used to live only in store
// state, leaving every page on "/" — real per-page URLs are what lets
// search engines index the site and users share deep links.
import { useStore, type State } from './store'

const LEGAL_DOCS = ['terms', 'privacy', 'refund']
const ID = /^[A-Za-z0-9_-]{1,40}$/

type RouteBits = Pick<State, 'route' | 'game' | 'article' | 'legalDoc'>

export function pathFor(s: RouteBits): string {
  switch (s.route) {
    case 'catalog': return '/catalog'
    case 'detail': return ID.test(s.game) ? `/game/${s.game}` : '/catalog'
    case 'topup': return ID.test(s.game) ? `/topup/${s.game}` : '/topup'
    case 'history': return '/history'
    case 'tools': return '/tools'
    case 'news': return '/news'
    case 'article': return ID.test(s.article) ? `/news/${s.article}` : '/news'
    case 'admin': return '/admin'
    case 'legal': return `/legal/${LEGAL_DOCS.includes(s.legalDoc) ? s.legalDoc : 'terms'}`
    default: return '/'
  }
}

export function statePatchFor(pathname: string): Partial<State> {
  const [a, b] = pathname.split('/').filter(Boolean)
  if (!a) return { route: 'home' }
  if (a === 'catalog') return { route: 'catalog' }
  if (a === 'game' && b && ID.test(b)) return { route: 'detail', game: b }
  if (a === 'topup') return b && ID.test(b) ? { route: 'topup', game: b } : { route: 'topup' }
  if (a === 'history') return { route: 'history' }
  if (a === 'tools') return { route: 'tools' }
  if (a === 'news') return b && ID.test(b) ? { route: 'article', article: b } : { route: 'news' }
  if (a === 'admin') return { route: 'admin' }
  if (a === 'legal') return { route: 'legal', legalDoc: b && LEGAL_DOCS.includes(b) ? b : 'terms' }
  return { route: 'home' }
}

let booted = false
export function initRouter() {
  if (booted || typeof window === 'undefined') return
  booted = true
  // Adopt the URL the visitor landed on (deep links, search results),
  // normalizing unknown paths back to "/".
  useStore.setState({ payStatus: 'idle', ...statePatchFor(window.location.pathname) })
  window.history.replaceState({}, '', pathFor(useStore.getState()) + window.location.search)
  // Push a history entry whenever navigation changes the page.
  useStore.subscribe((state) => {
    const path = pathFor(state)
    if (path !== window.location.pathname) window.history.pushState({}, '', path)
  })
  // Browser back/forward.
  window.addEventListener('popstate', () => {
    useStore.setState({ payStatus: 'idle', ...statePatchFor(window.location.pathname) })
    window.scrollTo(0, 0)
  })
}
