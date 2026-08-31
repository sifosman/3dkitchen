import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Simple kitchen cabinet geometry
function Cabinet({ position, size, color, rotation = [0, 0, 0] }) {
  const meshRef = useRef()
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color.hex,
      roughness: color.texture === 'gloss' ? 0.1 : color.texture === 'super-matte' ? 0.9 : 0.5,
      metalness: color.texture === 'mirror' ? 0.9 : 0.1,
    })
  }, [color])

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} material={material}>
      <boxGeometry args={size} />
    </mesh>
  )
}

// Kitchen scene with cabinets
export default function KitchenScene({ selectedColor }) {
  const groupRef = useRef()

  // Animate slight rotation for demo
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, 2, -3]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[6, 5, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* Base Cabinets - Bottom row */}
      <Cabinet 
        position={[-2, 0, -2.5]} 
        size={[1.5, 1, 0.6]} 
        color={selectedColor}
      />
      <Cabinet 
        position={[0, 0, -2.5]} 
        size={[1.5, 1, 0.6]} 
        color={selectedColor}
      />
      <Cabinet 
        position={[2, 0, -2.5]} 
        size={[1.5, 1, 0.6]} 
        color={selectedColor}
      />
      
      {/* Wall Cabinets - Top row */}
      <Cabinet 
        position={[-2, 2.2, -2.5]} 
        size={[1.5, 0.8, 0.4]} 
        color={selectedColor}
      />
      <Cabinet 
        position={[0, 2.2, -2.5]} 
        size={[1.5, 0.8, 0.4]} 
        color={selectedColor}
      />
      <Cabinet 
        position={[2, 2.2, -2.5]} 
        size={[1.5, 0.8, 0.4]} 
        color={selectedColor}
      />
      
      {/* Countertop */}
      <mesh position={[0, 0.55, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.1, 0.7]} />
        <meshStandardMaterial color="#1a202c" roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Kitchen Island */}
      <Cabinet 
        position={[0, 0, 1]} 
        size={[2, 1, 1]} 
        color={selectedColor}
      />
      <mesh position={[0, 0.55, 1]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#1a202c" roughness={0.2} metalness={0.3} />
      </mesh>
      
      {/* Sink area */}
      <mesh position={[0, 0.5, -2.4]} castShadow>
        <boxGeometry args={[1, 0.15, 0.5]} />
        <meshStandardMaterial color="#718096" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Stove */}
      <mesh position={[2, 0.5, -2.4]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.5]} />
        <meshStandardMaterial color="#2d3748" roughness={0.5} />
      </mesh>
      
      {/* Handles */}
      {[-2, 0, 2].map((x, i) => (
        <mesh key={`handle-base-${i}`} position={[x, 0.3, -2.2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      
      {[-2, 0, 2].map((x, i) => (
        <mesh key={`handle-wall-${i}`} position={[x, 2.2, -2.3]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      
      {/* Island handle */}
      <mesh position={[0, 0.3, 1.5]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
