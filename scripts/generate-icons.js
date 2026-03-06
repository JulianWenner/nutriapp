// Script para generar iconos PWA placeholder
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
}

function generateIcon(size) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Fondo teal
    ctx.fillStyle = '#0D7C72'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, size * 0.22)
    ctx.fill()

    // Letra N blanca
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${size * 0.5}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('N', size / 2, size / 2)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buffer)
    console.log(`Generated icon-${size}.png`)
}

generateIcon(192)
generateIcon(512)
