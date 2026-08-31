import { useState, useRef, useEffect, useCallback } from 'react'
import { boardColors, defaultColor } from '../data/boardColors'

// Cabinet regions in the sample image (normalized coordinates 0-1)
// These define where the cabinets are in the image
const CABINET_REGIONS = [
  // Upper cabinets
  { id: 'upper-left', x: 0.08, y: 0.15, width: 0.28, height: 0.25, type: 'upper' },
  { id: 'upper-mid', x: 0.38, y: 0.15, width: 0.28, height: 0.25, type: 'upper' },
  { id: 'upper-right', x: 0.68, y: 0.15, width: 0.24, height: 0.25, type: 'upper' },
  // Lower cabinets
  { id: 'lower-left', x: 0.05, y: 0.55, width: 0.25, height: 0.35, type: 'lower' },
  { id: 'lower-mid', x: 0.32, y: 0.55, width: 0.30, height: 0.35, type: 'lower' },
  { id: 'lower-right', x: 0.65, y: 0.55, width: 0.30, height: 0.35, type: 'lower' },
]

export default function PhotoColorizer() {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [selectedColor, setSelectedColor] = useState(defaultColor)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeRegion, setActiveRegion] = useState('all') // 'all' or specific region id

  // Load and process image
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      imageRef.current = img
      setImageLoaded(true)
      applyColor(img, ctx, selectedColor, activeRegion)
    }
    
    img.src = '/images/kitchen-sample.jpg'
  }, [])

  // Apply color when selection changes
  useEffect(() => {
    if (imageLoaded && imageRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      applyColor(imageRef.current, ctx, selectedColor, activeRegion)
    }
  }, [selectedColor, activeRegion, imageLoaded])

  const applyColor = (img, ctx, color, region) => {
    setIsProcessing(true)
    
    // Draw original image
    ctx.drawImage(img, 0, 0)
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const data = imageData.data
    
    // Parse target color
    const targetColor = hexToRgb(color.hex)
    
    // Determine which regions to process
    const regionsToProcess = region === 'all' 
      ? CABINET_REGIONS 
      : CABINET_REGIONS.filter(r => r.id === region)
    
    // Process each cabinet region
    regionsToProcess.forEach(region => {
      const startX = Math.floor(region.x * ctx.canvas.width)
      const startY = Math.floor(region.y * ctx.canvas.height)
      const endX = Math.floor((region.x + region.width) * ctx.canvas.width)
      const endY = Math.floor((region.y + region.height) * ctx.canvas.height)
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const i = (y * ctx.canvas.width + x) * 4
          
          // Check if pixel is light (likely cabinet)
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3
          
          // Only modify light pixels (cabinets are white/light)
          if (brightness > 180) {
            // Calculate how "white" the pixel is
            const whiteness = Math.min(r, g, b) / 255
            
            // Blend original with target color based on whiteness
            const blendFactor = whiteness * 0.85 // Adjust intensity
            
            data[i] = Math.round(r * (1 - blendFactor) + targetColor.r * blendFactor)
            data[i + 1] = Math.round(g * (1 - blendFactor) + targetColor.g * blendFactor)
            data[i + 2] = Math.round(b * (1 - blendFactor) + targetColor.b * blendFactor)
          }
        }
      }
    })
    
    ctx.putImageData(imageData, 0, 0)
    setIsProcessing(false)
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
  }

  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">HDS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Kitchen Visualizer</h1>
              <p className="text-xs text-slate-400">AI Photo Color Replacement</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showComparison 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showComparison ? 'Hide Comparison' : 'Compare'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Image Viewer */}
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
          <div className="relative max-w-full max-h-full">
            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 rounded-lg">
                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Comparison slider */}
            {showComparison ? (
              <div 
                className="relative cursor-ew-resize select-none"
                onMouseMove={handleSliderChange}
                onTouchMove={(e) => {
                  const touch = e.touches[0]
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = touch.clientX - rect.left
                  const percentage = (x / rect.width) * 100
                  setSliderPosition(Math.max(0, Math.min(100, percentage)))
                }}
              >
                {/* Original image (right side) */}
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src="/images/kitchen-sample.jpg" 
                    alt="Original Kitchen"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                  
                  {/* Colored overlay (left side) */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <canvas 
                      ref={canvasRef}
                      className="max-w-full max-h-[70vh] object-contain"
                      style={{ 
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                  
                  {/* Slider line */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedColor.name}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Original
                </div>
              </div>
            ) : (
              /* Single view */
              <div className="relative">
                <canvas 
                  ref={canvasRef}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
                
                {/* Color info overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    {selectedColor.image ? (
                      <img 
                        src={selectedColor.image} 
                        alt={selectedColor.name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-slate-600"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-lg border-2 border-slate-600"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-lg">{selectedColor.name}</h3>
                      <p className="text-sm text-slate-400">{selectedColor.category}</p>
                      {selectedColor.price > 0 && (
                        <p className="text-sm text-green-400 font-semibold mt-1">
                          R{selectedColor.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Color Palette Sidebar */}
        <div className="w-full lg:w-96 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-3">Select Board Color</h2>
            
            {/* Region selector */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1 block">Apply to:</label>
              <select 
                value={activeRegion}
                onChange={(e) => setActiveRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Cabinets</option>
                <option value="upper-left">Upper Left</option>
                <option value="upper-mid">Upper Middle</option>
                <option value="upper-right">Upper Right</option>
                <option value="lower-left">Lower Left</option>
                <option value="lower-mid">Lower Middle</option>
                <option value="lower-right">Lower Right</option>
              </select>
            </div>
          </div>
          
          {/* Color grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {boardColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color)}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedColor.id === color.id
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="aspect-square relative">
                    {color.image ? (
                      <img
                        src={color.image}
                        alt={color.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    
                    {selectedColor.id === color.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 bg-slate-800">
                    <p className="text-xs font-medium text-white truncate">{color.name}</p>
                    <p className="text-xs text-slate-400 truncate">{color.category}</p>
                    {color.price > 0 && (
                      <p className="text-xs text-green-400 font-medium mt-1">
                        R{color.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-400 text-center">
              {boardColors.length} colors available
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
