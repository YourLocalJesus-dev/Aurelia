// Audio Engine with real instrumental background track ("Harvey - Her's") + tactile micro-clicks
class SoundLandscape {
  private audioEl: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private isEnabled: boolean = false
  private fadeInterval: number | null = null
  private masterGain: GainNode | null = null

  constructor() {
    // Lazy initialize on first interaction
  }

  private initAudio() {
    if (!this.audioEl) {
      this.audioEl = new Audio('/harvey.mp3')
      this.audioEl.loop = true
      this.audioEl.volume = 0
      this.audioEl.preload = 'auto'
    }

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public toggleSound(force?: boolean): boolean {
    const nextState = force !== undefined ? force : !this.isEnabled
    this.isEnabled = nextState
    this.initAudio()

    if (this.isEnabled) {
      this.fadeInMusic(0.4)
      this.playChime(523.25, 1.2)
    } else {
      this.fadeOutMusic()
    }

    return this.isEnabled
  }

  public get active(): boolean {
    return this.isEnabled
  }

  private fadeInMusic(targetVolume = 0.4) {
    if (!this.audioEl) return
    if (this.fadeInterval) clearInterval(this.fadeInterval)

    this.audioEl.play().catch(() => {
      // Autoplay blocked until user gesture
    })

    let vol = this.audioEl.volume
    this.fadeInterval = window.setInterval(() => {
      if (!this.audioEl) return
      vol = Math.min(targetVolume, vol + 0.04)
      this.audioEl.volume = vol
      if (vol >= targetVolume) {
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
      }
    }, 60)
  }

  private fadeOutMusic() {
    if (!this.audioEl) return
    if (this.fadeInterval) clearInterval(this.fadeInterval)

    let vol = this.audioEl.volume
    this.fadeInterval = window.setInterval(() => {
      if (!this.audioEl) return
      vol = Math.max(0, vol - 0.05)
      this.audioEl.volume = vol
      if (vol <= 0) {
        this.audioEl.pause()
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
      }
    }, 60)
  }

  // Warm tactile UI tap (for buttons, menus)
  public playTick(freq = 600) {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.04)

      gain.gain.setValueAtTime(0.025, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(t)
      osc.stop(t + 0.05)
    } catch {
      // ignore
    }
  }

  // Warm chime for modal reveals & key actions
  public playChime(freq = 523.25, duration = 1.4) {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return
    try {
      const t = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, t)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.03, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(t)
      osc.stop(t + duration + 0.1)
    } catch {
      // ignore
    }
  }

  // Melodic note trigger for kinetic hover interactions
  public playPianoNote(freq: number, velocity = 0.25, duration = 1.8) {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return
    try {
      const t = this.ctx.currentTime
      const osc1 = this.ctx.createOscillator()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(freq, t)

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1000, t)
      filter.frequency.exponentialRampToValueAtTime(350, t + duration)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(velocity * 0.08, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

      osc1.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)

      osc1.start(t)
      osc1.stop(t + duration + 0.1)
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundLandscape()
