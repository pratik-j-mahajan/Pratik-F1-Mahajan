import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Small canvas-drawn textures, so the scene needs no downloaded image files.

export function textTexture(text, { width = 1024, height = 256, font = '600 180px Poppins, sans-serif', color = '#fff', stroke } = {}) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (stroke) {
    ctx.lineWidth = 3
    ctx.strokeStyle = stroke
    ctx.strokeText(text, width / 2, height / 2)
  } else {
    ctx.fillStyle = color
    ctx.fillText(text, width / 2, height / 2)
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export function panelTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, '#0b0f22')
  g.addColorStop(1, '#141b38')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(0, 0, 3, 512)
  ctx.fillRect(0, 255, 512, 2)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  return tex
}

export function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 288
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#04060c'
  ctx.fillRect(0, 0, 512, 288)
  ctx.font = '500 22px Poppins, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('SECTOR 1', 28, 44)
  ctx.fillText('TYRES  SOFT · 96°C', 28, 262)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'right'
  ctx.fillText('0:28.406', 484, 44)
  ctx.strokeStyle = '#28ff9f'
  ctx.lineWidth = 4
  ctx.shadowColor = '#28ff9f'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ;[48, 40, 44, 22, 26, 12, 30, 18, 34, 14, 20, 8].forEach((v, i) => {
    const x = 28 + i * 41
    const y = 80 + v * 2.6
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  })
  ctx.stroke()
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}
