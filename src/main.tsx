import { useEffect, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './kinetic.css'
import './alive.css'
import './cinematic.css'
import { Loader } from './components/Loader'
import { CelestialCanvas } from './components/CelestialCanvas'
import { ObjectStudio } from './components/ObjectStudio'
import { StoryModal } from './components/StoryModal'
import { AboutModal } from './components/AboutModal'
import { KineticManifesto } from './components/KineticManifesto'
import { CustomCursor } from './components/CustomCursor'
import { sound } from './components/AudioEngine'

const Arrow = () => <span className="arrow" aria-hidden="true">↗</span>

function App() {
  const [menu, setMenu] = useState(false)
  const [introFinished, setIntroFinished] = useState(false)
  const [activeScene, setActiveScene] = useState(0)
  const [isStoryOpen, setIsStoryOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isAudioActive, setIsAudioActive] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  const handleIntroComplete = useCallback(() => {
    setIntroFinished(true)
  }, [])

  // Live Atelier Time (Tokyo / London)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      setCurrentTime(timeStr)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Audio Toggle
  const toggleAudio = () => {
    const next = sound.toggleSound()
    setIsAudioActive(next)
  }

  // Keyboard navigation & controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key.toLowerCase() === 'm') {
        toggleAudio()
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const targetId = chapterTargets[parseInt(e.key) - 1]
        const targetEl = document.querySelector(targetId)
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' })
          sound.playTick(500 + parseInt(e.key) * 100)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Intersection Observer for active chapters
  useEffect(() => {
    const scenes = document.querySelectorAll<HTMLElement>('.scene')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            const idx = Array.from(scenes).indexOf(entry.target as HTMLElement)
            if (idx !== -1) {
              setActiveScene(idx)
            }
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      { threshold: 0.25 }
    )

    scenes.forEach((scene) => observer.observe(scene))
    return () => observer.disconnect()
  }, [])

  // Scroll Progress Variable for Parallax & Kinetic Effects
  useEffect(() => {
    let frame = 0
    const updateMotion = () => {
      const stages = document.querySelectorAll<HTMLElement>('.scene-stage')
      stages.forEach((stage) => {
        const rect = stage.getBoundingClientRect()
        const progressVal = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight || 1)))
        stage.style.setProperty('--scroll-progress', progressVal.toFixed(3))
      })
      frame = 0
    }

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(updateMotion)
      }
    }

    updateMotion()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateMotion)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateMotion)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const copyEmailToClipboard = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText('hello@aurelia.studio')
    setCopiedEmail(true)
    sound.playChime(640, 0.7)
    setTimeout(() => setCopiedEmail(false), 2800)
  }

  const chapters = ['ARRIVAL', 'POINT OF VIEW', 'MANIFESTO', 'STILLNESS', 'OBJECTS', 'CONTACT']
  const chapterTargets = ['#top', '#about', '#manifesto', '#stories', '#objects', '#contact']

  return (
    <>
      <CustomCursor />

      {/* Avant-Garde Out-of-the-Box Loader */}
      {!introFinished && <Loader onComplete={handleIntroComplete} />}

      {/* Luxury Film Grain Overlay */}
      <div className="film-grain-overlay" aria-hidden="true" />

      {/* Top Floating Glass Header */}
      <header>
        <div className="header-left">
          <a
            className="wordmark"
            href="#top"
            data-cursor="HOME"
            onClick={() => sound.playTick(600)}
          >
            AURELIA<span>®</span>
          </a>
          <span className="header-tagline">ATELIER MMXXVI</span>
        </div>

        <div className="header-center-hud">
          <span className="hud-label">TOKYO ATELIER</span>
          <span className="hud-time">{currentTime || '12:00:00'} JST</span>
        </div>

        <div className="header-right">
          <button
            type="button"
            className={`audio-toggle-btn ${isAudioActive ? 'is-active' : ''}`}
            onClick={toggleAudio}
            data-cursor="SOUND"
            title="Toggle Ambient Audio (Press 'M')"
            aria-label="Toggle Sound"
          >
            <span className="sound-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="sound-text">{isAudioActive ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>

          <nav className={menu ? 'open' : ''}>
            <a href="#about" onClick={() => { setMenu(false); sound.playTick(650); }} data-cursor="VIEW">Philosophy</a>
            <a href="#manifesto" onClick={() => { setMenu(false); sound.playTick(700); }} data-cursor="VIEW">Manifesto</a>
            <a href="#stories" onClick={() => { setMenu(false); sound.playTick(750); }} data-cursor="VIEW">Stories</a>
            <a href="#objects" onClick={() => { setMenu(false); sound.playTick(800); }} data-cursor="VIEW">Objects</a>
            <a href="#contact" onClick={() => { setMenu(false); sound.playTick(850); }} data-cursor="VIEW">Contact</a>
          </nav>

          <button
            className="menu"
            onClick={() => {
              setMenu(!menu)
              sound.playTick(500)
            }}
            aria-label="Toggle menu"
            data-cursor="MENU"
          >
            <b />
            <b />
          </button>
        </div>
      </header>

      {/* Floating Chapter Rail */}
      <aside className="chapter-rail" aria-label="Chapter navigation">
        <span className="rail-title">CHAPTERS</span>
        {chapters.map((chapter, index) => (
          <a
            className={activeScene === index ? 'active' : ''}
            href={chapterTargets[index]}
            key={chapter}
            data-cursor="GOTO"
            onClick={() => sound.playTick(500 + index * 100)}
          >
            <span className="rail-indicator" />
            <i>0{index + 1}</i>
            <b>{chapter}</b>
          </a>
        ))}
      </aside>

      <main id="top">
        {/* Chapter 01: ARRIVAL */}
        <div className="scene-stage">
          <section className="hero scene is-visible">
            <div className="hero-copy reveal">
              <div className="badge-row">
                <span className="badge-dot" />
                <p className="eyebrow">An independent design practice · est. 2024</p>
              </div>
              <h1>
                For the<br />
                <em>unhurried</em><br />
                eye.
              </h1>
            </div>

            {/* Interactive Generative Celestial Orb */}
            <div
              className="hero-orb-container"
              data-cursor="ABOUT"
              onClick={() => {
                setIsAboutOpen(true)
                sound.playChime(523.25, 1.2)
              }}
              title="Click to explore Aurelia Atelier"
            >
              <CelestialCanvas />
              <button
                type="button"
                className="planet-explore-badge"
                aria-label="Explore Aurelia"
              >
                <span>✦ EXPLORE AURELIA</span>
              </button>
            </div>

            <div className="hero-foot">
              <div className="hero-foot-desc">
                <p>We choreograph objects, spaces and sensory identities<br />that leave room for sacred wonder.</p>
                <div className="hero-subtags">
                  <span>ARCHITECTURE</span>
                  <span>·</span>
                  <span>MATERIAL ARTIFACTS</span>
                  <span>·</span>
                  <span>CREATIVE DIRECTION</span>
                </div>
              </div>

              <button
                type="button"
                className="round-link"
                data-cursor="ABOUT"
                onClick={() => {
                  setIsAboutOpen(true)
                  sound.playChime(523.25, 1.2)
                }}
                aria-label="Explore Aurelia Atelier"
              >
                <span>Explore<br />Aurelia</span>
                <Arrow />
              </button>
            </div>
          </section>
        </div>

        {/* Chapter 02: POINT OF VIEW */}
        <div className="scene-stage" id="about">
          <section className="statement scene">
            <div className="badge-row">
              <span className="badge-dot" />
              <p className="eyebrow">Chapter 02 · Our point of view</p>
            </div>
            <h2>
              Design is not a<br />
              <em>solution.</em> It’s a feeling<br />
              that stays with you.
            </h2>
            <div className="statement-bottom-row">
              <div className="small-copy">
                Aurelia is a creative direction studio in quiet pursuit of the exceptional. We make considered work for people with a sense of place.
              </div>
              <div className="statement-creed">
                <span>01 // NO REPETITION</span>
                <span>02 // TACTILE TRUTH</span>
                <span>03 // LASTING RESONANCE</span>
              </div>
            </div>
          </section>
        </div>

        {/* Chapter 03: MANIFESTO */}
        <div className="scene-stage" id="manifesto">
          <KineticManifesto />
        </div>

        {/* Chapter 04: STILLNESS */}
        <div className="scene-stage" id="stories">
          <section className="feature scene">
            <div className="feature-meta">
              <div className="badge-row">
                <span className="badge-dot" />
                <p className="eyebrow">Chapter 04 · Featured story · 2025</p>
              </div>
              <h2>
                House of<br />
                <em>stillness</em>
              </h2>
              <p>A sanctuary made from shadow, volcanic stone and the ritual of arriving.</p>
              
              <div className="story-action-group">
                <button
                  type="button"
                  className="editorial-open-btn"
                  onClick={() => {
                    setIsStoryOpen(true)
                    sound.playChime(432, 1)
                  }}
                  data-cursor="DOSSIER"
                >
                  <span>Open Architectural Dossier</span>
                  <Arrow />
                </button>
                <span className="story-read-time">4 MIN READ · 12 SPECIFICATIONS</span>
              </div>
            </div>

            <div
              className="feature-art"
              data-cursor="INSPECT"
              onClick={() => {
                setIsStoryOpen(true)
                sound.playChime(523.25, 1.2)
              }}
            >
              <img
                src="/house-of-stillness.jpg"
                alt="House of Stillness — Kyoto Sanctuary Villa"
                className="feature-art-img"
              />
              <div className="art-overlay-gradient" />
              <span className="coordinate">35° 41' N&nbsp;&nbsp; 139° 41' E · KYOTO RESIDENCE</span>
              <div className="art-hover-badge">CLICK TO READ DOSSIER</div>
            </div>
          </section>
        </div>

        {/* Chapter 05: OBJECTS STUDIO */}
        <div className="scene-stage" id="objects">
          <section className="manifesto scene">
            <ObjectStudio />
            <div className="studio-bottom-closing">
              <p className="closing">
                Made slowly, intended<br />
                to be <em>kept.</em>
              </p>
            </div>
          </section>
        </div>

        {/* Chapter 06: CONTACT */}
        <div className="scene-stage" id="contact">
          <section className="contact scene">
            <div className="contact-top">
              <div className="badge-row">
                <span className="badge-dot" />
                <p className="eyebrow">Chapter 06 · A new chapter</p>
              </div>
              <h2>
                Let’s make<br />
                something <em>felt.</em>
              </h2>
            </div>

            <div className="contact-center">
              <a
                href="mailto:hello@aurelia.studio"
                className="email"
                onClick={copyEmailToClipboard}
                data-cursor="COPY"
                title="Click to copy email address"
              >
                <span>hello@aurelia.studio</span>
                <Arrow />
              </a>

              {copiedEmail && (
                <div className="copied-toast">
                  <span>✓ Email copied to clipboard</span>
                </div>
              )}

              <div className="contact-pillars">
                <div className="pillar">
                  <h4>INQUIRIES</h4>
                  <p>Private commissions, brand identities, and spatial creative direction.</p>
                </div>
                <div className="pillar">
                  <h4>LOCATIONS</h4>
                  <p>Tokyo · Milan · New Delhi · London</p>
                </div>
                <div className="pillar">
                  <h4>COLLABORATION</h4>
                  <p>Spring / Summer 2026 scheduling currently open.</p>
                </div>
              </div>
            </div>

            <div className="contact-foot">
              <p className="fine">
                Aurelia Studio Atelier © 2026 · All Rights Reserved.<br />
                Crafted for the unhurried eye.
              </p>
              <a
                href="#top"
                className="back-to-top-btn"
                data-cursor="TOP"
                onClick={() => sound.playTick(900)}
              >
                <span>Back to Arrival</span>
                <span className="up-arrow">↑</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Immersive Architectural Story Modal */}
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />

      {/* About Aurelia Studio Monograph Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
