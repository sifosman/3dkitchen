import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

// Create procedural wood texture
function createWoodTexture(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Base color
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 512, 512)
  
  // Add wood grain
  const imageData = ctx.getImageData(0, 0, 512, 512)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % 512
    const y = Math.floor((i / 4) / 512)
    
    // Wood grain pattern
    const grain = Math.sin(x * 0.02) * 20 + Math.sin(y * 0.01) * 10
    const noise = (Math.random() - 0.5) * 15
    
    data[i] = Math.max(0, Math.min(255, data[i] + grain + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain + noise))
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// Create dark marble/countertop texture
function createCountertopTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Deep charcoal base
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add subtle marble veins
  for (let i = 0; i < 25; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.04})`
    ctx.lineWidth = 0.5 + Math.random() * 2
    
    ctx.beginPath()
    const startY = Math.random() * 512
    ctx.moveTo(0, startY)
    
    const cp1x = 512 * 0.25 + Math.random() * 128
    const cp1y = startY + (Math.random() - 0.5) * 200
    const cp2x = 512 * 0.75 + Math.random() * 128
    const cp2y = startY + (Math.random() - 0.5) * 200
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, 512, startY + (Math.random() - 0.5) * 100)
    ctx.stroke()
  }
  
  // Subtle speckle
  const imageData = ctx.getImageData(0, 0, 512, 512)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < 0.02) {
      const v = Math.random() * 40
      data[i] += v
      data[i + 1] += v
      data[i + 2] += v
    }
  }
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Cabinet component
function Cabinet({ position, size, color, rotation = [0, 0, 0] }) {
  const materials = useMemo(() => {
    const isGloss = color.texture === 'gloss' || color.texture === 'super-gloss'
    const isMatte = color.texture === 'super-matte' || color.texture === 'matt'
    const isWood = color.texture === 'woodgrain' || color.texture === 'linear' || color.texture === 'peen'
    
    let material
    
    if (isWood) {
      const woodTexture = createWoodTexture(color.hex)
      material = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.7,
        metalness: 0.05,
      })
    } else if (isGloss) {
      material = new THREE.MeshPhysicalMaterial({
        color: color.hex,
        roughness: 0.08,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        reflectivity: 1,
      })
    } else if (isMatte) {
      material = new THREE.MeshStandardMaterial({
        color: color.hex,
        roughness: 0.9,
        metalness: 0.02,
      })
    } else {
      material = new THREE.MeshStandardMaterial({
        color: color.hex,
        roughness: 0.45,
        metalness: 0.05,
      })
    }
    
    return material
  }, [color])

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.02} smoothness={4} material={materials} castShadow receiveShadow />
      <RoundedBox 
        args={[size[0] * 0.95, size[1] * 0.95, 0.02]} 
        radius={0.01} 
        smoothness={4} 
        position={[0, 0, size[2] / 2 + 0.01]}
        material={materials}
        castShadow
      />
    </group>
  )
}

// Handle component
function Handle({ position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.25, 16]} />
      <meshStandardMaterial color="#A0A0A0" metalness={0.95} roughness={0.08} />
    </mesh>
  )
}

// Kitchen scene with darker, premium aesthetics
export default function KitchenScene({ selectedColor }) {
  const groupRef = useRef()
  
  const countertopTexture = useMemo(() => createCountertopTexture(), [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.04) * 0.008
    }
  })

  return (
    <group ref={groupRef}>
      {/* Floor — Dark wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      
      {/* Back Wall — Dark charcoal */}
      <mesh position={[0, 2, -3.5]} receiveShadow>
        <boxGeometry args={[14, 6, 0.2]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
      </mesh>
      
      {/* Left Wall — Dark charcoal */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color="#252525" roughness={0.85} />
      </mesh>

      {/* Base Cabinets - Back wall */}
      <Cabinet position={[-2.5, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[-1.2, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[0.2, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[1.5, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[2.8, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      
      {/* Base Cabinets - Left wall */}
      <Cabinet position={[-4.5, 0, -1.5]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      <Cabinet position={[-4.5, 0, -0.2]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      <Cabinet position={[-4.5, 0, 1.2]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      
      {/* Wall Cabinets - Top row */}
      <Cabinet position={[-2.5, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      <Cabinet position={[-1.2, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      <Cabinet position={[0.2, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      <Cabinet position={[1.5, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      <Cabinet position={[2.8, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      
      {/* Countertop - Back wall */}
      <mesh position={[0.15, 0.48, -3]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.06, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
      </mesh>
      
      {/* Countertop - Left wall */}
      <mesh position={[-4.5, 0.48, -0.15]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.06, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
      </mesh>
      
      {/* Kitchen Island */}
      <group position={[0, 0, 1.5]}>
        <Cabinet position={[0, 0, 0]} size={[2.4, 0.9, 1.2]} color={selectedColor} />
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.06, 1.4]} />
          <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
        </mesh>
        {/* Island handles */}
        <Handle position={[-0.8, 0.3, 0.62]} />
        <Handle position={[0, 0.3, 0.62]} />
        <Handle position={[0.8, 0.3, 0.62]} />
      </group>
      
      {/* Sink */}
      <group position={[0.2, 0.5, -2.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.15, 0.5]} />
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Faucet */}
        <mesh position={[0, 0.2, -0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.35, -0.1]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.95} roughness={0.08} />
        </mesh>
      </group>
      
      {/* Stove/Cooktop */}
      <group position={[2.8, 0.5, -2.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.05, 0.55]} />
          <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Burners */}
        {[[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.03, z]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
        ))}
      </group>
      
      {/* Range Hood */}
      <group position={[2.8, 2.5, -3]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.4, 0.5]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.4]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      {/* Cabinet Handles - Base back wall */}
      {[-2.5, -1.2, 0.2, 1.5, 2.8].map((x, i) => (
        <Handle key={`base-back-${i}`} position={[x, 0.35, -2.68]} />
      ))}
      
      {/* Cabinet Handles - Base left wall */}
      {[-1.5, -0.2, 1.2].map((z, i) => (
        <Handle key={`base-left-${i}`} position={[-4.18, 0.35, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      
      {/* Cabinet Handles - Wall cabinets */}
      {[-2.5, -1.2, 0.2, 1.5, 2.8].map((x, i) => (
        <Handle key={`wall-${i}`} position={[x, 2.1, -2.81]} />
      ))}
      
      {/* Pendant Lights over island — warm gold-tinted glow */}
      <group position={[0, 2.5, 1.5]}>
        {[-0.6, 0, 0.6].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial color="#fff8e8" roughness={0.25} transparent opacity={0.85} />
            </mesh>
            <pointLight position={[0, -0.1, 0]} intensity={0.6} color="#fff8e0" distance={3} />
          </group>
        ))}
      </group>
      
      {/* Under-cabinet lighting */}
      <pointLight position={[0, 1.8, -2.8]} intensity={0.35} color="#fff8e8" distance={4} />
      
      {/* Window — subtle ambient */}
      <group position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Window frame outer */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.1, 1.6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* Window glass with subtle night blue */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.9, 1.4]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#0a0a1e" emissiveIntensity={0.15} />
        </mesh>
      </group>
    </group>
  )
}