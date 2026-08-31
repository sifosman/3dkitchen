import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
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
    
    data[i] = Math.max(0, Math.min(255, data[i] + grain + noise))     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain + noise)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain + noise)) // B
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// Create marble/countertop texture
function createCountertopTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Dark base
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, 512, 512)
  
  // Add marble veins
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 2
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * 512, Math.random() * 512)
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512
    )
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Cabinet component with realistic materials
function Cabinet({ position, size, color, rotation = [0, 0, 0], isWall = false }) {
  const meshRef = useRef()
  
  const materials = useMemo(() => {
    const isGloss = color.texture === 'gloss' || color.texture === 'super-gloss'
    const isMatte = color.texture === 'super-matte' || color.texture === 'matt'
    const isWood = color.texture === 'woodgrain' || color.texture === 'linear' || color.texture === 'peen'
    
    let material
    
    if (isWood) {
      // Wood grain texture
      const woodTexture = createWoodTexture(color.hex)
      material = new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.7,
        metalness: 0.1,
      })
    } else if (isGloss) {
      // High gloss
      material = new THREE.MeshPhysicalMaterial({
        color: color.hex,
        roughness: 0.05,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        reflectivity: 1,
      })
    } else if (isMatte) {
      // Super matte
      material = new THREE.MeshStandardMaterial({
        color: color.hex,
        roughness: 0.95,
        metalness: 0.05,
      })
    } else {
      // Standard finish
      material = new THREE.MeshStandardMaterial({
        color: color.hex,
        roughness: 0.5,
        metalness: 0.1,
      })
    }
    
    return material
  }, [color])

  return (
    <group position={position} rotation={rotation}>
      {/* Cabinet body */}
      <RoundedBox args={size} radius={0.02} smoothness={4} material={materials} castShadow receiveShadow />
      
      {/* Cabinet door with slight offset for depth */}
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
      <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
    </mesh>
  )
}

// Kitchen scene with realistic materials
export default function KitchenScene({ selectedColor }) {
  const groupRef = useRef()
  
  const countertopTexture = useMemo(() => createCountertopTexture(), [])

  // Subtle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Floor - Wood look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.8} />
      </mesh>
      
      {/* Back Wall - Light neutral */}
      <mesh position={[0, 2, -3.5]} receiveShadow>
        <boxGeometry args={[14, 6, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[8, 6, 0.2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* Base Cabinets - L-shaped layout */}
      {/* Back wall cabinets */}
      <Cabinet position={[-2.5, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[-1.2, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[0.2, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[1.5, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      <Cabinet position={[2.8, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      
      {/* Left wall cabinets */}
      <Cabinet position={[-4.5, 0, -1.5]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      <Cabinet position={[-4.5, 0, -0.2]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      <Cabinet position={[-4.5, 0, 1.2]} size={[1.2, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      
      {/* Wall Cabinets - Top row */}
      <Cabinet position={[-2.5, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} isWall />
      <Cabinet position={[-1.2, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} isWall />
      <Cabinet position={[0.2, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} isWall />
      <Cabinet position={[1.5, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} isWall />
      <Cabinet position={[2.8, 2.1, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} isWall />
      
      {/* Countertop - Back wall */}
      <mesh position={[0.15, 0.48, -3]} castShadow receiveShadow>
        <boxGeometry args={[6.5, 0.06, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Countertop - Left wall */}
      <mesh position={[-4.5, 0.48, -0.15]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.06, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Kitchen Island */}
      <group position={[0, 0, 1.5]}>
        <Cabinet position={[0, 0, 0]} size={[2.4, 0.9, 1.2]} color={selectedColor} />
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.06, 1.4]} />
          <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.3} />
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
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Faucet */}
        <mesh position={[0, 0.2, -0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.35, -0.1]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
      
      {/* Stove/Cooktop */}
      <group position={[2.8, 0.5, -2.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.05, 0.55]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Burners */}
        {[[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.03, z]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
            <meshStandardMaterial color="#333333" roughness={0.5} />
          </mesh>
        ))}
      </group>
      
      {/* Range Hood */}
      <group position={[2.8, 2.5, -3]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.4, 0.5]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.4]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      
      {/* Cabinet Handles - Base cabinets back wall */}
      {[-2.5, -1.2, 0.2, 1.5, 2.8].map((x, i) => (
        <Handle key={`base-back-${i}`} position={[x, 0.35, -2.68]} />
      ))}
      
      {/* Cabinet Handles - Base cabinets left wall */}
      {[-1.5, -0.2, 1.2].map((z, i) => (
        <Handle key={`base-left-${i}`} position={[-4.18, 0.35, z]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      
      {/* Cabinet Handles - Wall cabinets */}
      {[-2.5, -1.2, 0.2, 1.5, 2.8].map((x, i) => (
        <Handle key={`wall-${i}`} position={[x, 2.1, -2.81]} />
      ))}
      
      {/* Pendant Lights over island */}
      <group position={[0, 2.5, 1.5]}>
        {[-0.6, 0, 0.6].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial color="#f5f5f5" roughness={0.3} transparent opacity={0.9} />
            </mesh>
            <pointLight position={[0, -0.1, 0]} intensity={0.5} color="#fff5e6" distance={3} />
          </group>
        ))}
      </group>
      
      {/* Under-cabinet lighting */}
      <pointLight position={[0, 1.8, -2.8]} intensity={0.3} color="#fff5e6" distance={4} />
      
      {/* Window on right wall */}
      <group position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[2, 1.5]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
        </mesh>
        {/* Window frame */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[2.1, 1.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.9, 1.4]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  )
}
