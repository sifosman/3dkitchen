import { useState, useEffect } from 'react'
import { boardColors } from '../data/boardColors'

// Check if image exists for a color
const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

export default function PreGeneratedColorizer() {
  const [selectedColor, setSelectedColor] = useState(boardColors[0])
  const [showComparison, setShowComparison] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [availableColors, setAvailableColors] = useState([])

  // Filter to only colors with available images
  useEffect(() => {
    const checkImages = async () => {
      const available = [];
      for (const color of boardColors) {
        const imageUrl = `/images/generated-colors/${color.id}.png`;
        const exists = await checkImageExists(imageUrl);
        if (exists) {
          available.push(color);
        }
      }
      setAvailableColors(available);
      if (available.length > 0) {
        setSelectedColor(available[0]);
      }
    };
    checkImages();
  }, []);

  const handleColorSelect = (color) => {
    setImageLoaded(false)
    setSelectedColor(color)
  }

  const handleSliderChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  if (availableColors.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading colors...</p>
        </div>
      </div>
    );
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
              <p className="text-xs text-slate-400">AI-Generated Board Colors</p>
            </div>
          </div>
          
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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Image Viewer */}
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
          <div className="relative max-w-full max-h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 rounded-lg">
                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
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
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src="/images/kitchen-base.jpg" 
                    alt="Original Kitchen"
                    className="max-w-full max-h-[70vh] object-contain"
                    onLoad={() => setImageLoaded(true)}
                  />
                  
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img 
                      src={`/images/generated-colors/${selectedColor.id}.png`}  
                      alt={selectedColor.name}
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
                  
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedColor.name}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Original
                </div>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={`/images/generated-colors/${selectedColor.id}.png`}  
                  alt={selectedColor.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  onLoad={() => setImageLoaded(true)}
                />
                
                <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 rounded-lg border-2 border-slate-600"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
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
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {availableColors.map((color) => (
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
          
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-400 text-center">
              {availableColors.length} colors available
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
