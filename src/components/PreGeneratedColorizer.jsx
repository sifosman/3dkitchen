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
  const [activeCategory, setActiveCategory] = useState('All')

  // Get unique categories
  const categories = ['All', ...new Set(boardColors.map(c => c.category))]

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

  // Filter by category
  const filteredColors = activeCategory === 'All' 
    ? availableColors 
    : availableColors.filter(c => c.category === activeCategory);

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
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="hds-body text-gray-600">Loading colors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="hds-heading text-2xl text-black">Select Your Board Color</h2>
            <p className="hds-label text-gray-500 mt-1">Visualize HDS boards in a real kitchen</p>
          </div>
          
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`hds-btn ${showComparison ? 'hds-btn-primary' : ''}`}
          >
            {showComparison ? 'Hide Comparison' : 'Compare'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Image Viewer */}
        <div className="flex-1 relative bg-gray-100 flex items-center justify-center p-6 overflow-hidden">
          <div className="relative max-w-full max-h-full">
            {!imageLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-100/80 rounded-lg">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
                <div className="relative overflow-hidden shadow-2xl">
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
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-black text-white px-4 py-2 text-sm hds-label">
                  {selectedColor.name}
                </div>
                <div className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 text-sm hds-label border border-gray-200">
                  Original
                </div>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={`/images/generated-colors/${selectedColor.id}.png`}  
                  alt={selectedColor.name}
                  className="max-w-full max-h-[70vh] object-contain shadow-2xl"
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Color Info Card */}
                <div className="absolute bottom-6 left-6 bg-white shadow-xl p-5 max-w-sm border-l-4 border-black">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-16 h-16 flex-shrink-0 border border-gray-200"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div className="flex-1">
                      <h3 className="hds-heading text-xl text-black">{selectedColor.name}</h3>
                      <p className="hds-label text-gray-500 mt-1">{selectedColor.category}</p>
                      {selectedColor.price > 0 && (
                        <p className="hds-heading text-lg text-black mt-2">
                          R{selectedColor.price.toLocaleString()}
                        </p>
                      )}
                      {selectedColor.sku && (
                        <p className="hds-body text-xs text-gray-400 mt-1">SKU: {selectedColor.sku}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Color Palette Sidebar */}
        <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-hidden flex flex-col">
          {/* Category Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs hds-label transition-all ${
                    activeCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color Grid */}
          <div className="flex-1 overflow-y-auto hds-scroll p-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color)}
                  className={`group relative text-left transition-all ${
                    selectedColor.id === color.id
                      ? 'ring-2 ring-black ring-offset-2'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="hds-card hds-image-overlay">
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
                        <div className="absolute top-2 right-2 w-6 h-6 bg-black flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white">
                      <p className="hds-heading text-sm text-black truncate">{color.name}</p>
                      <p className="hds-label text-gray-500 text-xs mt-0.5 truncate">{color.category}</p>
                      {color.price > 0 && (
                        <p className="hds-heading text-sm text-black mt-1">
                          R{color.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="hds-label text-gray-500 text-center text-xs">
              {filteredColors.length} colors available
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
