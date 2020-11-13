import React from 'react'

const CanvasTools = () => {
  const init = () => {
    const canvas = document.getElementById('drawing-board') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    const pageWidth = document.documentElement.clientWidth
    const pageHeight = document.documentElement.clientHeight
    canvas.width = pageWidth
    canvas.height = pageHeight
  }
  return (
    <div>
      <canvas id="drawing-board"></canvas>
    </div>
  )
}

export default CanvasTools
