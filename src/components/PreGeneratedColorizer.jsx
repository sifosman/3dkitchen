import { useState, useEffect, useCallback } from 'react'
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

export default function PreGeneratedColorizer({ initialColorId = null, onFallbackTo3D = null }) {
  const [selectedColor, setSelectedColor] = useState(boardColors[0])
  const [showComparison, setShowComparison] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [availableColors, setAvailableColors] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [paletteOpen, setPaletteOpen] = useState(false)

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
      const requested = initialColorId ? available.find((c) => c.id === initialColorId) : null;
      if (requested) {
        setSelectedColor(requested);
      } else if (initialColorId && boardColors.some((c) => c.id === initialColorId)) {
        // Requested colour exists in the catalog but has no pre-generated photo — show it in 3D mode instead
        if (onFallbackTo3D) onFallbackTo3D();
      } else if (available.length > 0) {
        setSelectedColor(available[0]);
      }
    };
    checkImages();
  }, []);

  // Filter by category
  const filteredColors = activeCategory === 'All' 
    ? availableColors 
    : availableColors.filter(c => c.category === activeCategory);

  const handleColorSelect = useCallback((color) => {
    setImageLoaded(false)
    setSelectedColor(color)
    // Close mobile palette after selection
    if (window.innerWidth < 1024) {
      setPaletteOpen(false)
    }
  }, [])

  const handleSliderChange = useCallback((clientX, currentTarget) => {
    const rect = currentTarget.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }, [])

  if (availableColors.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-hds-black">
        <div className="text-center">
          <div className="relative mb-5">
            <div className="w-14 h-14 border-2 border-hds-gold/30 border-t-hds-gold rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-14 h-14 border-2 border-hds-gold/10 rounded-full mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
          </div>
          <p className="text-white/60 font-medium">Loading colors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Image Viewer */}
      <div className="flex-1 relative bg-hds-black flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="relative max-w-full max-h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-hds-black/60 backdrop-blur-sm rounded-xl">
              <div className="w-10 h-10 border-2 border-hds-gold/40 border-t-hds-gold rounded-full animate-spin" />
            </div>
          )}
          
          {showComparison ? (
            <div 
              className="relative cursor-ew-resize select-none rounded-xl overflow-hidden shadow-2xl"
              onMouseMove={(e) => handleSliderChange(e.clientX, e.currentTarget)}
              onTouchMove={(e) => {
                const touch = e.touches[0]
                handleSliderChange(touch.clientX, e.currentTarget)
              }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src="/images/kitchen-base.jpg" 
                  alt="Original Kitchen"
                  className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain"
                  onLoad={() => setImageLoaded(true)}
                />
                
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src={`/images/generated-colors/${selectedColor.id}.png`}  
                    alt={selectedColor.name}
                    className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain"
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
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-hds-gold rounded-full shadow-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-hds-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute bottom-4 left-4 hds-glass rounded-xl px-4 py-2.5 text-sm font-medium text-white border-l-2 border-hds-gold">
                {selectedColor.name}
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 rounded-xl px-4 py-2.5 text-sm font-medium text-hds-black">
                Original
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img 
                src={`/images/generated-colors/${selectedColor.id}.png`}  
                alt={selectedColor.name}
                className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain"
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Color Info Card */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 max-w-[260px] sm:max-w-sm">
                <div className="hds-glass rounded-2xl p-4 sm:p-5 border-l-2 border-hds-gold shadow-elevated">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {selectedColor.image ? (
                      <img
                        src={selectedColor.image}
                        alt={selectedColor.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-xl ring-1 ring-white/10"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-white font-semibold text-sm sm:text-lg truncate">
                        {selectedColor.name}
                      </h3>
                      <p className="text-[11px] uppercase tracking-wider text-white/40 mt-0.5">
                        {selectedColor.category}
                      </p>
                      {selectedColor.price > 0 && (
                        <p className="font-heading text-hds-gold font-semibold text-sm sm:text-base mt-1">
                          R{selectedColor.price.toLocaleString()}
                        </p>
                      )}
                      {selectedColor.sku && (
                        <p className="text-[10px] text-white/20 mt-0.5 font-mono tracking-wider">
                          SKU: {selectedColor.sku}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compare toggle button */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`absolute top-4 right-4 z-10 hds-glass rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-300 min-h-touch flex items-center gap-2 ${
            showComparison
              ? 'bg-hds-gold/15 border-hds-gold/30 text-hds-gold'
              : 'text-white/60 hover:text-white/90'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showComparison ? 'Hide Compare' : 'Compare'}
        </button>

        {/* Mobile: palette toggle */}
        <button
          onClick={() => setPaletteOpen(!paletteOpen)}
          className="lg:hidden absolute top-4 left-4 z-10 hds-glass rounded-full px-4 py-2.5 text-xs font-medium text-white/80 hover:text-white flex items-center gap-2 min-h-touch transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Colors
        </button>
      </div>

      {/* Desktop: Sidebar palette */}
      <div className="hidden lg:block w-[420px] border-l border-white/[0.06] bg-hds-dark-500 overflow-hidden">
        <ColorPaletteSidebar 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          filteredColors={filteredColors}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
        />
      </div>

      {/* Mobile: Bottom drawer palette */}
      {paletteOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 mobile-drawer-overlay animate-fade-in"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh] rounded-t-2xl animate-slide-up shadow-elevated"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="bg-hds-dark-500 border-t border-white/[0.06] rounded-t-2xl h-full flex flex-col">
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>
              <div className="flex-1 min-h-0">
                <ColorPaletteSidebar 
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  filteredColors={filteredColors}
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Internal sidebar component for the photo mode
function ColorPaletteSidebar({ categories, activeCategory, onCategoryChange, filteredColors, selectedColor, onColorSelect }) {
  return (
    <div className="h-full flex flex-col">
      {/* Category Filter */}
      <div className="p-3 sm:p-4 border-b border-white/[0.06] flex-shrink-0">
        <h2 className="text-sm sm:text-base font-heading text-white font-semibold mb-3">
          Select Board Color
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-hds-gold text-hds-black shadow-gold-sm'
                  : 'bg-white/[0.04] text-white/50 hover:text-white/80 border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Color Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto color-palette-scroll p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {filteredColors.map((color) => {
            const isSelected = selectedColor.id === color.id
            return (
              <button
                key={color.id}
                onClick={() => onColorSelect(color)}
                className={`group relative rounded-xl overflow-hidden transition-all duration-200 min-h-touch text-left ${
                  isSelected
                    ? 'ring-2 ring-hds-gold ring-offset-2 ring-offset-hds-dark-500 shadow-gold'
                    : 'border border-white/[0.06] hover:border-white/[0.15] hover:shadow-elevated'
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
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-hds-gold rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3.5 h-3.5 text-hds-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-2.5 bg-hds-dark-400">
                  <p className="text-[11px] sm:text-xs font-medium text-white truncate">{color.name}</p>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/35 truncate mt-0.5">{color.category}</p>
                  {color.price > 0 && (
                    <p className="text-[11px] sm:text-xs font-heading text-hds-gold font-semibold mt-1">
                      R{color.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-hds-dark-600/50 flex-shrink-0">
        <p className="text-[10px] sm:text-xs text-white/25 text-center">
          {filteredColors.length} color{filteredColors.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  )
}