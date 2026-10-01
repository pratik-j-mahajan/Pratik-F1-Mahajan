import { useCallback, useEffect, useRef, useState } from 'react'

const TRACK_SRC = '/audio/theme.mp3'
const VOLUME = 0.35

// Plays public/audio/theme.mp3 on loop. If that file is missing, falls back to a
// soft synthesized ambient pad so the toggle always does something.
export default function useMusic() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const synthRef = useRef(null)

  const startSynth = () => {
    if (!synthRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const master = ctx.createGain()
      master.gain.value = 0
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 900
      filter.connect(master).connect(ctx.destination)

      // A-minor pad: slightly detuned voices for width
      const voices = [
        [110, 'sawtooth', 0.12],
        [110.6, 'sawtooth', 0.12],
        [164.8, 'triangle', 0.18],
        [220, 'sine', 0.2],
        [261.6, 'sine', 0.1],
      ]
      voices.forEach(([freq, type, level]) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = type
        osc.frequency.value = freq
        gain.gain.value = level
        osc.connect(gain).connect(filter)
        osc.start()
      })

      // Slow filter sweep so the pad breathes
      const lfo = ctx.createOscillator()
      const lfoDepth = ctx.createGain()
      lfo.frequency.value = 0.07
      lfoDepth.gain.value = 350
      lfo.connect(lfoDepth).connect(filter.frequency)
      lfo.start()

      synthRef.current = { ctx, master }
    }
    const { ctx, master } = synthRef.current
    ctx.resume()
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5)
  }

  const stopSynth = () => {
    if (!synthRef.current) return
    const { ctx, master } = synthRef.current
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
  }

  const toggle = useCallback(() => {
    if (playing) {
      audioRef.current?.pause()
      stopSynth()
      setPlaying(false)
      return
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(TRACK_SRC)
      audioRef.current.loop = true
      audioRef.current.volume = VOLUME
    }
    audioRef.current.play().catch(startSynth)
    setPlaying(true)
  }, [playing])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      synthRef.current?.ctx.close()
    },
    []
  )

  return { playing, toggle }
}
