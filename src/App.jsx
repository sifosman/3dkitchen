import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import KitchenScene from './components/KitchenScene'
import ColorPalette from './components/ColorPalette'
import Header from './components/Header'
import { boardColors, defaultColor } from './data/boardColors'

function App() {
  const [selectedColor, setSelectedColor] = useState(defaultColor)
  const [isLoading, setIsLoading] = useState(false)

  const handleColorSelect = useCallback((color) => {
    setIsLoading(true)
    setSelectedColor(color)
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <Canvas
            camera={{ position: [4, 2, 6], fov: 50 }}
            style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
          >
            <ambientLight intensity={0.4} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <KitchenScene selectedColor={selectedColor} />
            
            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2} />
            <Environment preset="apartment" />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={15}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
          
          {/* Color info overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-slate-600"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <div>
                <h3 className="font-semibold text-white">{selectedColor.name}</h3>
                <p className="text-sm text-slate-400">{selectedColor.category}</p>
                {selectedColor.price > 0 && (
                  <p className="text-sm text-green-400 font-medium">R{selectedColor.price.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Color Palette Sidebar */}
        <div className="w-full lg:w-96 bg-slate-800 border-t lg:border-t-0 lg:border-l border-slate-700 overflow-hidden flex flex-col">
          <ColorPalette 
            colors={boardColors}
            selectedColor={selectedColor}
            onColorSelect={handleColorSelect}
          />
        </div>
      </div>
    </div>
  )
}

export default App
