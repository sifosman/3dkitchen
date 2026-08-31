import { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, SoftShadows } from '@react-three/drei'
import KitchenScene from './components/KitchenScene'
import ColorPalette from './components/ColorPalette'
import Header from './components/Header'
import { boardColors, defaultColor } from './data/boardColors'

function LoadingFallback() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading 3D Kitchen...</p>
      </div>
    </div>
  )
}

function App() {
  const [selectedColor, setSelectedColor] = useState(defaultColor)
  const [isLoading, setIsLoading] = useState(false)

  const handleColorSelect = useCallback((color) => {
    setIsLoading(true)
    setSelectedColor(color)
    setTimeout(() => setIsLoading(false), 200)
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
            camera={{ position: [5, 3, 5], fov: 45 }}
            style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1a)' }}
            shadows
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <Suspense fallback={null}>
              {/* Lighting Setup */}
              <ambientLight intensity={0.3} />
              
              {/* Main ceiling light */}
              <directionalLight 
                position={[5, 8, 5]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={20}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
              />
              
              {/* Fill light */}
              <directionalLight position={[-5, 5, -5]} intensity={0.4} />
              
              {/* Warm accent */}
              <pointLight position={[0, 4, 0]} intensity={0.5} color="#fff5e6" />
              
              <SoftShadows size={25} samples={16} focus={0.5} />
              
              <KitchenScene selectedColor={selectedColor} />
              
              <ContactShadows position={[0, -0.49, 0]} opacity={0.6} scale={15} blur={2.5} far={4} />
              
              {/* Environment for reflections */}
              <Environment preset="apartment" background={false} />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={12}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.2}
                target={[0, 0.5, 0]}
                enableDamping
                dampingFactor={0.05}
              />
            </Suspense>
          </Canvas>
          
          {/* Color info overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 max-w-xs shadow-xl border border-slate-700">
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
          
          {/* Controls hint */}
          <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-400">
            <p>🖱️ Drag to rotate • Scroll to zoom • Right-click to pan</p>
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

// Import THREE for tone mapping
import * as THREE from 'three'

export default App
