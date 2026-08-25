import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [label, setLabel] = useState('')
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let frame: number
    const target = { x: -100, y: -100 }

    const onMouseMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      setPos({ x: e.clientX, y: e.clientY })
      setIsVisible(true)

      // Detect cursor targets
      const targetElem = (e.target as HTMLElement)?.closest('[data-cursor]')
      if (targetElem) {
        const cursorType = targetElem.getAttribute('data-cursor') || ''
        setLabel(cursorType)
        setIsHovering(true)
      } else if ((e.target as HTMLElement)?.closest('a, button, input, [role="button"]')) {
        setLabel('')
        setIsHovering(true)
      } else {
        setLabel('')
        setIsHovering(false)
      }
    }

    const onMouseDown = () => setIsClicking(true)
    const onMouseUp = () => setIsClicking(false)
    const onMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.body.addEventListener('mouseleave', onMouseLeave)

    const updateTrail = () => {
      setTrail((prev) => ({
        x: prev.x + (target.x - prev.x) * 0.2,
        y: prev.y + (target.y - prev.y) * 0.2
      }))
      frame = requestAnimationFrame(updateTrail)
    }
    frame = requestAnimationFrame(updateTrail)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Precision center dot */}
      <div
        className={`cursor-dot ${isHovering ? 'is-hover' : ''} ${isClicking ? 'is-click' : ''}`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`
        }}
      />

      {/* Trailing luminous aura ring */}
      <div
        className={`cursor-ring ${isHovering ? 'is-hover' : ''} ${label ? 'has-label' : ''} ${isClicking ? 'is-click' : ''}`}
        style={{
          transform: `translate3d(${trail.x}px, ${trail.y}px, 0)`
        }}
      >
        {label && <span className="cursor-label">{label}</span>}
      </div>
    </>
  )
}
