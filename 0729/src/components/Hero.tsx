import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const SEGMENTS = 56
const INK = '#22304d'
const CREAM = '#fdf2f7'
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const MESSAGES = ['今日どこ行く？', '海雲台、行こう。', '地下鉄で30分！']
const TYPE_MS = 100
const DELETE_MS = 50
const PAUSE_MS = 2000

/** Busan at dusk/night — all four hold the ink-above / cream-below contrast
 *  floor under the hero tints, measured per photo. */
const WALLPAPERS = [
  'https://images.unsplash.com/photo-1762759448909-28d3eb42b825?w=1800&q=68&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1704544993415-9c6b80c359ed?w=1800&q=68&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1704544998076-8bc53108ff36?w=1800&q=68&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1641730146205-f6e594f7a619?w=1800&q=68&auto=format&fit=crop',
]
const WALLPAPER_MS = 7000

const SPOTS = [
  { src: 'https://images.unsplash.com/photo-1672671187899-a10f547341f1?w=240&q=70&auto=format&fit=crop', caption: '甘川文化村' },
  { src: 'https://images.unsplash.com/photo-1610696326548-07109f442da6?w=240&q=70&auto=format&fit=crop', caption: '海東龍宮寺' },
  { src: 'https://images.unsplash.com/photo-1700277842839-2ef54f815f47?w=240&q=70&auto=format&fit=crop', caption: '海雲台' },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function TypingMessages() {
  const [text, setText] = useState('')
  const [msgIndex, setMsgIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = MESSAGES[msgIndex]
    let timeout: number

    if (!deleting && text === current) {
      timeout = window.setTimeout(() => setDeleting(true), PAUSE_MS)
    } else if (deleting && text === '') {
      setDeleting(false)
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    } else {
      timeout = window.setTimeout(
        () => setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)),
        deleting ? DELETE_MS : TYPE_MS,
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, msgIndex])

  return (
    <div className="inline-flex items-center gap-1.5 mb-4 text-[12px] tracking-[0.04em]">
      <span className="opacity-55">「</span>
      <span className="min-h-[1.4em] whitespace-nowrap">{text}</span>
      <motion.span
        className="inline-block w-[1.5px] h-[1.1em] align-middle"
        style={{ background: CREAM }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <span className="opacity-55">」</span>
    </div>
  )
}

/** Rendered twice — once in ink above the waterline, once in cream below it. */
function Headline() {
  return (
    <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-10">
      <div className="text-[10px] tracking-[0.34em] font-bold opacity-90 mb-5 sm:mb-7">
        2&nbsp;LINES&ensp;・&ensp;6&nbsp;SPOTS&ensp;・&ensp;BUSAN
      </div>
      <h1
        className="hero-display m-0"
        style={{ fontSize: 'clamp(40px, min(11.5vw, 13.5svh), 138px)', lineHeight: 0.98 }}
      >
        <span className="block">波の音まで、</span>
        <span className="block" style={{ marginLeft: '1.15em' }}>
          地下鉄で。
        </span>
      </h1>
    </div>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const seaPathRef = useRef<SVGPathElement>(null)
  const skyPathRef = useRef<SVGPathElement>(null)
  const crestPathRef = useRef<SVGPathElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [wallpaper, setWallpaper] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setWallpaper((w) => (w + 1) % WALLPAPERS.length), WALLPAPER_MS)
    return () => clearInterval(id)
  }, [reduceMotion])

  useEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    const seaPath = seaPathRef.current
    const skyPath = skyPathRef.current
    const crestPath = crestPathRef.current
    const overlay = overlayRef.current
    if (!section || !svg || !seaPath || !skyPath || !crestPath || !overlay) return

    let width = 0
    let height = 0
    let baseY = 0
    let wavelength = 400
    let amplitude = 22
    const CYCLES = 1.6

    let phase = 0
    let targetPhase = 0
    let rafId = 0

    function layout() {
      const rect = section!.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      width = rect.width
      height = rect.height
      baseY = height * 0.54
      wavelength = width / (CYCLES * 2 * Math.PI)
      amplitude = Math.max(18, Math.min(42, height * 0.045))
      svg!.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }
    layout()

    function buildPoints(currentPhase: number) {
      const pts: [number, number][] = []
      for (let i = 0; i <= SEGMENTS; i++) {
        const x = (width / SEGMENTS) * i
        pts.push([x, baseY + Math.sin(x / wavelength + currentPhase) * amplitude])
      }
      return pts
    }

    function render() {
      const pts = buildPoints(phase)
      let line = `M0,${pts[0][1].toFixed(1)}`
      for (let i = 1; i < pts.length; i++) {
        line += ` L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`
      }

      seaPath!.setAttribute('d', `${line} L${width},${height} L0,${height} Z`)
      crestPath!.setAttribute('d', line)

      let sky = `M0,0 L${width},0`
      for (let i = pts.length - 1; i >= 0; i--) {
        sky += ` L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`
      }
      skyPath!.setAttribute('d', `${sky} Z`)

      // same waterline, as a CSS polygon, so the cream copy layer is revealed
      // only where the sea is — the wave slices the type as it moves
      const poly = pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')
      overlay!.style.clipPath = `polygon(${poly},${width}px ${height}px,0px ${height}px)`
    }

    function tick() {
      phase = lerp(phase, targetPhase, 0.05)
      render()
      rafId = requestAnimationFrame(tick)
    }
    tick()

    function onMouseMove(e: MouseEvent | TouchEvent) {
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX
      targetPhase = ((clientX / window.innerWidth) * 2 - 1) * 1.7
    }

    // the section is sized in svh, so its box can settle after mount — track it.
    // render() here too: rAF is paused while the tab is hidden, so a resize that
    // lands in that window would otherwise never reach the DOM.
    const ro = new ResizeObserver(() => {
      layout()
      render()
    })
    ro.observe(section)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onMouseMove, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onMouseMove)
    }
  }, [])

  const rise = reduceMotion ? {} : { y: 24 }

  return (
    <section ref={sectionRef} className="relative w-full h-[100svh] min-h-[560px] overflow-hidden">
      {/* wallpaper stack — all mounted so a switch never lands on an unloaded image */}
      {WALLPAPERS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: i === wallpaper ? 1 : 0 }}
        />
      ))}

      {/* the waterline splits one photo into two moods: pink dawn above, night sea below */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="hero-sky-wash" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(253,236,245,0.82)" />
            <stop offset="100%" stopColor="rgba(247,214,231,0.55)" />
          </linearGradient>
          <linearGradient id="hero-sea-tint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(11,30,48,0.48)" />
            <stop offset="100%" stopColor="rgba(11,30,48,0.82)" />
          </linearGradient>
        </defs>
        <path ref={skyPathRef} d="" fill="url(#hero-sky-wash)" />
        <path ref={seaPathRef} d="" fill="url(#hero-sea-tint)" />
        <path
          ref={crestPathRef}
          d=""
          fill="none"
          stroke={CREAM}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 1px 10px rgba(253,242,247,0.55))' }}
        />
      </svg>

      {/* two identical copies of the headline; the lower one is clipped to the sea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <div className="absolute inset-0 flex items-center" style={{ color: INK }}>
          <Headline />
        </div>
        {/* soft halo only here: specular city lights sit right under the waterline
            and drop cream-on-photo contrast below the large-text floor */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-center"
          style={{ color: CREAM, textShadow: '0 2px 26px rgba(8,24,40,0.65)' }}
          aria-hidden
        >
          <Headline />
        </div>
      </motion.div>

      {/* supporting copy + CTA, low left, over the dark sea */}
      <motion.div
        initial={{ opacity: 0, ...rise }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.55, ease: EASE_OUT }}
        className="absolute inset-x-0 bottom-9 sm:bottom-12 z-20"
        style={{ color: CREAM }}
      >
        <div className="w-full max-w-[1240px] mx-auto px-6 sm:px-10 flex items-end justify-between gap-8">
          <div>
            <TypingMessages />
            <p className="text-[13px] sm:text-[14px] leading-relaxed opacity-85 max-w-[300px] m-0 mb-5">
              駅ごとにまとめた、釜山の小さな旅ガイド。
            </p>
            <a
              href="#course-preview"
              className="hero-cta inline-flex items-center gap-3 text-[12.5px] tracking-[0.08em] px-5 py-2.5 rounded-full"
            >
              コースを見る
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="hidden md:flex gap-3">
            {SPOTS.map((spot, i) => (
              <motion.figure
                key={spot.caption}
                initial={{ opacity: 0, ...rise }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.75 + i * 0.12, ease: EASE_OUT }}
                className="m-0 w-[74px] lg:w-[86px]"
              >
                <img
                  src={spot.src}
                  alt=""
                  className="block w-full aspect-square object-cover rounded-[3px] opacity-90"
                />
                <figcaption className="text-[9.5px] tracking-[0.1em] opacity-70 pt-2">{spot.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
