import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    // Check if device is touch or small screen
    if (window.matchMedia('(max-width: 960px), (pointer: coarse)').matches) {
      return
    }

    const dot = dotRef.current
    const ring = ringRef.current
    const labelEl = labelRef.current
    if (!dot || !ring) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let isVisible = false
    let isHovering = false
    let isClicking = false
    let currentLabel = ''
    let animId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isVisible) {
        isVisible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }

      // Direct dot positioning (instant, no lag)
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`

      // Target detection
      const target = e.target as HTMLElement | null
      const cursorTarget = target?.closest('[data-cursor]')
      const interactiveTarget = !cursorTarget && target?.closest('a, button, input, [role="button"]')

      if (cursorTarget) {
        const nextLabel = cursorTarget.getAttribute('data-cursor') || ''
        if (nextLabel !== currentLabel) {
          currentLabel = nextLabel
          if (labelEl) labelEl.textContent = currentLabel
          ring.classList.add('has-label')
        }
        if (!isHovering) {
          isHovering = true
          dot.classList.add('is-hover')
          ring.classList.add('is-hover')
        }
      } else if (interactiveTarget) {
        if (currentLabel !== '') {
          currentLabel = ''
          if (labelEl) labelEl.textContent = ''
          ring.classList.remove('has-label')
        }
        if (!isHovering) {
          isHovering = true
          dot.classList.add('is-hover')
          ring.classList.add('is-hover')
        }
      } else {
        if (currentLabel !== '') {
          currentLabel = ''
          if (labelEl) labelEl.textContent = ''
          ring.classList.remove('has-label')
        }
        if (isHovering) {
          isHovering = false
          dot.classList.remove('is-hover')
          ring.classList.remove('is-hover')
        }
      }
    }

    const onMouseDown = () => {
      isClicking = true
      dot.classList.add('is-click')
      ring.classList.add('is-click')
    }

    const onMouseUp = () => {
      isClicking = false
      dot.classList.remove('is-click')
      ring.classList.remove('is-click')
    }

    const onMouseLeave = () => {
      isVisible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown, { passive: true })
    window.addEventListener('mouseup', onMouseUp, { passive: true })
    document.body.addEventListener('mouseleave', onMouseLeave)

    // Smooth physics ring follow loop
    const animate = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.22
        ringY += (mouseY - ringY) * 0.22
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      {/* Precision center dot */}
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />

      {/* Trailing luminous aura ring */}
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }}>
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  )
}

