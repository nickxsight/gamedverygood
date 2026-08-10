import type { CSSProperties } from 'react'

// Parse an inline CSS declaration string ("a:b;c:d") into a React style object.
// The design prototype builds most styles as CSS strings (view-models return
// them verbatim), so this lets us keep those strings unchanged in the JSX port.
// Splitting is parentheses-aware so gradients / rgba() / url() with commas and
// colons survive intact.

const cache = new Map<string, CSSProperties>()

function splitTop(str: string, sep: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === sep && depth === 0) {
      out.push(str.slice(start, i))
      start = i + 1
      // for ':' we only want the first split — handled by caller
    }
  }
  out.push(str.slice(start))
  return out
}

function toCamel(prop: string): string {
  if (prop.startsWith('--')) return prop // CSS custom property: keep as-is
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function css(input?: string | CSSProperties | null): CSSProperties {
  if (!input) return {}
  if (typeof input !== 'string') return input
  const cached = cache.get(input)
  if (cached) return cached

  const style: Record<string, string> = {}
  for (const decl of splitTop(input, ';')) {
    const trimmed = decl.trim()
    if (!trimmed) continue
    const idx = trimmed.indexOf(':')
    if (idx === -1) continue
    const prop = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!prop) continue
    style[toCamel(prop)] = value
  }
  const result = style as CSSProperties
  cache.set(input, result)
  return result
}
