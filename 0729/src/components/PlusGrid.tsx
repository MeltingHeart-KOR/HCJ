import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const GRID_LENGTH = 9

class PlusSign {
  x = 0
  y = 0
  top = 0
  left = 0
  height = 0
  width = 0
  scale = 1

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.beginPath()
    ctx.setTransform(this.scale, 0, 0, this.scale, this.left + this.x, this.top + this.y)
    ctx.lineWidth = 2.5
    ctx.moveTo(0, -this.height / 2)
    ctx.lineTo(0, this.height / 2)
    ctx.moveTo(-this.width / 2, 0)
    ctx.lineTo(this.width / 2, 0)
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }
}

function dist([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy) || 1
}

export default function PlusGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const signs: PlusSign[][] = []
    for (let i = 0; i < GRID_LENGTH; i++) {
      signs[i] = []
      for (let j = 0; j < GRID_LENGTH; j++) {
        signs[i][j] = new PlusSign()
      }
    }

    const mouse = { x: 0, y: 0 }
    let mouseOver = false
    let mouseMoved = false

    function layout() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      const min = Math.min(canvas!.width, canvas!.height)
      for (let i = 0; i < GRID_LENGTH; i++) {
        for (let j = 0; j < GRID_LENGTH; j++) {
          const sign = signs[i][j]
          sign.left = (canvas!.width / (GRID_LENGTH + 1)) * (i + 1)
          sign.top = (canvas!.height / (GRID_LENGTH + 1)) * (j + 1)
          sign.width = min / 50
          sign.height = min / 50
        }
      }
    }
    layout()

    function calculateSigns() {
      for (let i = 0; i < GRID_LENGTH; i++) {
        for (let j = 0; j < GRID_LENGTH; j++) {
          const sign = signs[i][j]
          let hyp = Math.min(canvas!.width, canvas!.height) / (GRID_LENGTH + 1) / 2
          const d = dist([sign.left, sign.top], [mouse.x, mouse.y])
          const ax = mouse.x - sign.left
          const ay = mouse.y - sign.top
          const angle = Math.atan2(ay, ax)
          if (d < hyp + sign.width) {
            hyp = d
            gsap.to(sign, { duration: 0.3, scale: 2 })
          } else {
            gsap.to(sign, { duration: 0.3, scale: 1 })
          }
          gsap.to(sign, {
            duration: 0.3,
            x: Math.cos(angle) * hyp,
            y: Math.sin(angle) * hyp,
          })
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.strokeStyle = 'rgba(18, 60, 76, 0.4)'

      if (mouseOver && mouseMoved) {
        calculateSigns()
        mouseMoved = false
      }

      for (let i = 0; i < GRID_LENGTH; i++) {
        for (let j = 0; j < GRID_LENGTH; j++) {
          signs[i][j].draw(ctx!)
        }
      }
    }

    gsap.ticker.add(draw)

    function mouseMove(e: MouseEvent | TouchEvent) {
      let clientX: number
      let clientY: number
      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }
      mouse.x = clientX
      mouse.y = clientY
      mouseMoved = true
      mouseOver = true
    }

    function mouseLeave() {
      mouseOver = false
      for (let i = 0; i < GRID_LENGTH; i++) {
        for (let j = 0; j < GRID_LENGTH; j++) {
          gsap.to(signs[i][j], { duration: 0.3, x: 0, y: 0, scale: 1 })
        }
      }
    }

    function onResize() {
      layout()
    }

    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('touchmove', mouseMove, { passive: true })
    window.addEventListener('touchstart', mouseMove, { passive: true })
    window.addEventListener('mouseleave', mouseLeave)
    window.addEventListener('touchend', mouseLeave)
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('touchmove', mouseMove)
      window.removeEventListener('touchstart', mouseMove)
      window.removeEventListener('mouseleave', mouseLeave)
      window.removeEventListener('touchend', mouseLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
