import { useRef, useState, type CSSProperties } from 'react'
import { useStore } from '../store'

// Site artwork slot. Images are managed by admins (backoffice → รูปภาพ tab, or
// drag-and-drop in place while logged in as admin), stored server-side (D1),
// and visible to every visitor. When no image is uploaded the slot renders
// nothing, letting the parent card's branded gradient show through.

type Props = {
  id: string
  placeholder?: string
  radius?: number
  style?: CSSProperties
}

export default function ImageSlot({ id, placeholder = 'วางรูป', radius, style }: Props) {
  const ts = useStore((s) => s.serverImages[id])
  const isAdmin = useStore((s) => s.isAdmin)
  const uploadSlotImage = useStore((s) => s.uploadSlotImage)
  const [over, setOver] = useState(false)
  const depth = useRef(0)

  const br = radius != null ? `${radius}px` : (style as CSSProperties)?.borderRadius
  const src = ts ? `/api/images/${id}?v=${ts}` : null

  const adminHandlers = isAdmin ? {
    onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); depth.current++; setOver(true) },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy' },
    onDragLeave: (e: React.DragEvent) => { e.stopPropagation(); if (--depth.current <= 0) { depth.current = 0; setOver(false) } },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); depth.current = 0; setOver(false); uploadSlotImage(id, e.dataTransfer?.files?.[0]) },
  } : {}

  return (
    <div
      style={{ ...style, borderRadius: br }}
      title={isAdmin && !src ? `${placeholder} (ลากรูปมาวางเพื่ออัปโหลด)` : undefined}
      {...adminHandlers}
    >
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: br }}
        />
      )}
      {over && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: br, outline: '2px solid #c96442', outlineOffset: -2, background: 'rgba(201,100,66,.15)', pointerEvents: 'none', zIndex: 5 }} />
      )}
    </div>
  )
}
