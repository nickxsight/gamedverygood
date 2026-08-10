// The gamedverygood game-controller badge mark, reused in nav, login, footer.
export function LogoMark({ size = 38, radius = 11, icon = 23, shadow = false }: { size?: number; radius?: number; icon?: number; shadow?: boolean }) {
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', background: 'linear-gradient(150deg,var(--acc,#4f46e5),var(--acc2,#7c83ff))', borderRadius: radius, boxShadow: shadow ? '0 4px 14px -4px var(--acc,#4f46e5)' : undefined }}>
      <svg width={icon} height={icon} viewBox="0 0 28 28" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 10h8c2.8 0 5 2.2 5 5 0 2-1.6 3.7-3.7 3.7-1.1 0-2.2-.5-2.9-1.4l-.7-.9h-3.4l-.7.9c-.7.9-1.8 1.4-2.9 1.4C6.6 18.7 5 17 5 15c0-2.8 2.2-5 5-5Z" />
        <path d="M8.6 13.6v2.8M7.2 15h2.8" />
        <circle cx="17.6" cy="14.2" r=".55" fill="#fff" stroke="none" />
        <circle cx="19.2" cy="15.9" r=".55" fill="#fff" stroke="none" />
      </svg>
    </div>
  )
}
