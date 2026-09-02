import { useState, useCallback, Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, SoftShadows } from '@react-three/drei'
import * as THREE from 'three'
import KitchenScene from './components/KitchenScene'
import PreGeneratedColorizer from './components/PreGeneratedColorizer'
import ColorPalette from './components/ColorPalette'
import Header from './components/Header'
import { boardColors, defaultColor } from './data/boardColors'

function LoadingFallback() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-hds-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-hds-gold/30 border-t-hds-gold rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-hds-gold/10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        </div>
        <p className="text-sm text-white/60 font-medium tracking-wide">Loading 3D Kitchen...</p>
      </div>
    </div>
  )
}

// Controls hint — shows on hover/tap
function ControlsHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full hds-glass flex items-center justify-center text-white/50 hover:text-white/80 transition-all"
        aria-label="Show controls"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    )
  }

  return (
    <div 
      className="absolute top-4 right-4 z-10 hds-glass rounded-xl px-4 py-2.5 text-xs text-white/60 max-w-[200px] sm:max-w-none animate-fade-in"
      onClick={() => setVisible(false)}
    >
      <p className="leading-relaxed">
        <span className="text-white/80">Drag</span> to rotate ·{' '}
        <span className="text-white/80">Scroll</span> to zoom ·{' '}
        <span className="text-white/80">Right-click</span> to pan
      </p>
    </div>
  )
}

// Selected color info card — glassmorphism
function SelectedColorCard({ selectedColor }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 max-w-[260px] sm:max-w-xs animate-fade-in">
      <div className="hds-glass rounded-2xl p-4 border-l-2 border-hds-gold shadow-elevated">
        <div className="flex items-center gap-3">
          {selectedColor.image ? (
            <img
              src={selectedColor.image}
              alt={selectedColor.name}
              className="w-14 h-14 rounded-xl flex-shrink-0 object-cover ring-1 ring-white/10"
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-xl flex-shrink-0 ring-1 ring-white/10"
              style={{ backgroundColor: selectedColor.hex }}
            />
          )}
          <div className="min-w-0">
            <h3 className="font-heading text-white font-semibold text-sm sm:text-base truncate">
              {selectedColor.name}
            </h3>
            <p className="text-[11px] uppercase tracking-wider text-white/40 mt-0.5">
              {selectedColor.category}
            </p>
            {selectedColor.price > 0 && (
              <p className="font-heading text-hds-gold font-semibold text-sm mt-1">
                R{selectedColor.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mode toggle — premium pill design
function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex items-center">
      <div className="hds-glass rounded-full p-1 flex gap-0.5">
        <button
          onClick={() => onModeChange('photo')}
          className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 min-h-touch flex items-center ${
            mode === 'photo'
              ? 'bg-hds-gold text-hds-black shadow-gold'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <span className="hidden sm:inline mr-1.5">📸</span>
          Photo
        </button>
        <button
          onClick={() => onModeChange('3d')}
          className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 min-h-touch flex items-center ${
            mode === '3d'
              ? 'bg-hds-gold text-hds-black shadow-gold'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <span className="hidden sm:inline mr-1.5">🔮</span>
          3D
        </button>
      </div>
    </div>
  )
}

// Main layout wrapper
function AppLayout({ children, mode, onModeChange }) {
  return (
    <div className="w-full h-full flex flex-col bg-hds-black">
      <Header />
      
      {/* Top bar below header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 mt-14 sm:mt-16 border-b border-white/[0.04] bg-hds-dark-600/50">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-hds-gold font-semibold">
            {mode === 'photo' ? 'Photo Preview' : '3D Kitchen'}
          </p>
        </div>
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {children}
    </div>
  )
}

// ─── 3D Viewer ───
function ThreeDViewer({ selectedColor, onColorSelect }) {
  const [isLoading, setIsLoading] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  const handleColorSelect = useCallback((color) => {
    setIsLoading(true)
    onColorSelect(color)
    setTimeout(() => setIsLoading(false), 200)
    // Close palette on mobile after selection
    if (window.innerWidth < 1024) {
      setPaletteOpen(false)
    }
  }, [onColorSelect])

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* 3D Canvas Area */}
      <div className="flex-1 relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-hds-black/60 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-hds-gold/40 border-t-hds-gold rounded-full animate-spin" />
          </div>
        )}

        <Canvas
          camera={{ position: [5, 3, 5], fov: 45 }}
          style={{ background: '#0a0a0a' }}
          shadows
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          onCreated={({ gl }) => {
            // Ensure colors and textures are rendered in the same space as the board photos.
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.1
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.35} color="#fff6ec" />
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={1.6} 
              color="#fff0dd"
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-5, 5, -5]} intensity={0.45} color="#f0f0f4" />
            <pointLight position={[0, 4, 0]} intensity={0.5} color="#fff3e2" />
            <SoftShadows size={25} samples={16} focus={0.5} />
            
            <KitchenScene selectedColor={selectedColor} />
            
            <ContactShadows position={[0, -0.49, 0]} opacity={0.45} scale={15} blur={2.5} far={4} />
            <Environment preset="warehouse" background={false} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2.5}
              maxDistance={12}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
              target={[0, 0.5, 0]}
              enableDamping
              dampingFactor={0.05}
              touches={{
                one: THREE.TOUCH.ROTATE,
                two: THREE.TOUCH.DOLLY_PAN,
              }}
            />
          </Suspense>
        </Canvas>

        <ControlsHint />
        <SelectedColorCard selectedColor={selectedColor} />

        {/* Mobile: color palette toggle button */}
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
      <div className="hidden lg:block w-96 border-l border-white/[0.06] bg-hds-dark-500 overflow-hidden">
        <ColorPalette 
          colors={boardColors}
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
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-2xl overflow-hidden animate-slide-up shadow-elevated"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="bg-hds-dark-500 border-t border-white/[0.06] rounded-t-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>
              <ColorPalette 
                colors={boardColors}
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main App ───
function App() {
  const [mode, setMode] = useState('photo')
  const [selectedColor, setSelectedColor] = useState(defaultColor)

  // Listen for escape key to show/hide controls, etc.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p' || e.key === 'P') setMode('photo')
      if (e.key === 'd' || e.key === 'D') setMode('3d')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-full h-full">
      {mode === 'photo' ? (
        <div className="w-full h-full flex flex-col bg-hds-black">
          <Header />
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 mt-14 sm:mt-16 border-b border-white/[0.04] bg-hds-dark-600/50">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-hds-gold font-semibold">
                Photo Preview
              </p>
            </div>
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>
          <PreGeneratedColorizer />
        </div>
      ) : (
        <AppLayout mode={mode} onModeChange={setMode}>
          <ThreeDViewer selectedColor={selectedColor} onColorSelect={setSelectedColor} />
        </AppLayout>
      )}
    </div>
  )
}

export default App