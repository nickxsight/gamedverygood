import { useEffect, useRef, useState, type CSSProperties } from 'react'

// A real-app port of the design tool's <image-slot>. Displays an author-supplied
// image over the gradient fallback that the parent card already renders. Empty
// slots are transparent so the gradient + short-code show through, and clicks
// bubble to the parent (no onClick here) so card navigation still works.
//
// Images are filled by dragging a file onto the slot (or double-clicking to
// browse) and persist in localStorage keyed by the slot id — the equivalent of
// the prototype's sidecar. Ship default = gradient placeholders (game box art
// is copyrighted); drop your own licensed art to replace.

const PREFIX = 'gvg-slot:'
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
const MAX_DIM = 1200

const subs = new Set<() => void>()
function notify() { subs.forEach((fn) => fn()) }

function read(id: string): string | null {
  try { return localStorage.getItem(PREFIX + id) } catch { return null }
}
function write(id: string, url: string | null) {
  try {
    if (url) localStorage.setItem(PREFIX + id, url)
    else localStorage.removeItem(PREFIX + id)
  } catch { /* quota / disabled — session only */ }
  notify()
}

async function toDataUrl(file: File, targetW: number): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM)
    const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
    return canvas.toDataURL('image/webp', 0.85)
  } finally {
    bitmap.close?.()
  }
}

type Props = {
  id: string
  placeholder?: string
  radius?: number
  style?: CSSProperties
}

export default function ImageSlot({ id, placeholder = 'วางรูป', radius, style }: Props) {
  const [url, setUrl] = useState<string | null>(() => read(id))
  const [over, setOver] = useState(false)
  const depth = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sync = () => setUrl(read(id))
    subs.add(sync)
    sync()
    return () => { subs.delete(sync) }
  }, [id])

  async function ingest(file?: File | null) {
    if (!file || ACCEPT.indexOf(file.type) < 0) return
    try {
      const w = 400
      const dataUrl = await toDataUrl(file, w)
      write(id, dataUrl)
    } catch { /* ignore decode failures */ }
  }

  const br = radius != null ? `${radius}px` : undefined

  return (
    <div
      style={{ ...style, borderRadius: br ?? (style as CSSProperties)?.borderRadius }}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); depth.current++; setOver(true) }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' }}
      onDragLeave={(e) => { e.stopPropagation(); if (--depth.current <= 0) { depth.current = 0; setOver(false) } }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); depth.current = 0; setOver(false); ingest(e.dataTransfer?.files?.[0]) }}
      onDoubleClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
      title={url ? undefined : placeholder}
    >
      {url && (
        <img
          src={url}
          alt=""
          draggable={false}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: br }}
        />
      )}
      {over && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: br, outline: '2px solid #c96442', outlineOffset: -2, background: 'rgba(201,100,66,.10)', pointerEvents: 'none' }} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(',')}
        hidden
        onChange={(e) => { ingest(e.target.files?.[0]); e.target.value = '' }}
      />
    </div>
  )
}
