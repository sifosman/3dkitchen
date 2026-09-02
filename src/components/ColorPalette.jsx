import { useState, useMemo } from 'react'
import { colorFamilies, getColorsByFamily } from '../data/boardColors'

export default function ColorPalette({ colors, selectedColor, onColorSelect }) {
  const [activeFamily, setActiveFamily] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredColors = useMemo(() => {
    let filtered = colors
    
    if (activeFamily !== 'All') {
      filtered = getColorsByFamily(activeFamily)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [colors, activeFamily, searchQuery])

  const families = ['All', ...colorFamilies]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/[0.06] flex-shrink-0">
        <h2 className="text-sm sm:text-base font-heading text-white font-semibold mb-3">
          Select Board Color
        </h2>
        
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-hds-gold/50 focus:bg-white/[0.06] transition-all min-h-touch"
          />
        </div>
      </div>
      
      {/* Family Tabs */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5">
          {families.map((family) => (
            <button
              key={family}
              onClick={() => setActiveFamily(family)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                activeFamily === family
                  ? 'bg-hds-gold text-hds-black shadow-gold-sm'
                  : 'bg-white/[0.04] text-white/50 hover:text-white/80 hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {family}
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
                className={`group relative rounded-xl overflow-hidden transition-all duration-200 min-h-touch ${
                  isSelected
                    ? 'ring-2 ring-hds-gold ring-offset-2 ring-offset-hds-dark-500 shadow-gold'
                    : 'border border-white/[0.06] hover:border-white/[0.15] hover:shadow-elevated'
                }`}
              >
                {/* Color Preview */}
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
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-hds-gold rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3.5 h-3.5 text-hds-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Color Info */}
                <div className="p-2.5 bg-hds-dark-400">
                  <p className="text-[11px] sm:text-xs font-medium text-white truncate">
                    {color.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/35 truncate mt-0.5">
                    {color.category}
                  </p>
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
        
        {filteredColors.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-white/10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/40 text-sm">No colors found</p>
            <p className="text-white/20 text-xs mt-1">Try a different search term</p>
          </div>
        )}
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