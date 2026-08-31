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
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-3">Select Board Color</h2>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search colors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      {/* Family Tabs */}
      <div className="px-4 py-2 border-b border-slate-700 overflow-x-auto">
        <div className="flex gap-1">
          {families.map((family) => (
            <button
              key={family}
              onClick={() => setActiveFamily(family)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFamily === family
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {family}
            </button>
          ))}
        </div>
      </div>
      
      {/* Color Grid */}
      <div className="flex-1 overflow-y-auto color-palette-scroll p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorSelect(color)}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                selectedColor.id === color.id
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-slate-600 hover:border-slate-500'
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
                {selectedColor.id === color.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Color Info */}
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
        
        {filteredColors.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No colors found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-400 text-center">
          {filteredColors.length} colors available
        </p>
      </div>
    </div>
  )
}
