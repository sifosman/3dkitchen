import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Build a material that uses the actual board photo as the texture map,
// so the 3D render matches the board's real color/grain.
function useBoardMaterial(color) {
  // Use a pre-cropped real-kitchen door region if available (renderTexture) — better realism for test
  const textureUrl = color?.renderTexture || color?.image || '/images/hds-logo.webp'
  const hasRealTexture = !!color?.renderTexture || !!color?.image
  const texture = useTexture(textureUrl)

  const material = useMemo(() => {
    const isGloss = color.texture === 'gloss' || color.texture === 'super-gloss'
    const isMatte = color.texture === 'super-matte' || color.texture === 'matt'
    const isWood = color.texture === 'woodgrain' || color.texture === 'linear' || color.texture === 'peen'
    const isMirror = color.texture === 'mirror'

    // Mirror boards should render as real reflective surfaces, not a photo of
    // boards-on-a-shelf. Skip the image map for that finish.
    let map = null
    const useImageMap = color.texture !== 'mirror'
    if (useImageMap && hasRealTexture && texture && texture.image) {
      map = texture
      map.colorSpace = THREE.SRGBColorSpace
      map.wrapS = THREE.RepeatWrapping
      map.wrapT = THREE.RepeatWrapping
      // Crop to the center of the product photo to avoid watermarks/white borders
      // and tile that clean region across cabinet faces.
      const crop = 0.62
      const offset = (1 - crop) / 2
      map.repeat.set(crop, crop)
      map.offset.set(offset, offset)
      map.anisotropy = 8
      map.needsUpdate = true
    }

    const baseColor = map ? new THREE.Color('#ffffff') : new THREE.Color(color.hex)

    if (isGloss) {
      // Low-reflection satin gloss so the board photo's color dominates.
      return new THREE.MeshPhysicalMaterial({
        color: baseColor,
        map,
        roughness: map ? 0.4 : 0.3,
        metalness: 0.02,
        clearcoat: 0.25,
        clearcoatRoughness: 0.3,
        reflectivity: 0.15,
        envMapIntensity: 0.15,
      })
    }
    if (isMatte) {
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        map,
        roughness: map ? 0.95 : 0.9,
        metalness: 0.02,
        envMapIntensity: 0.12,
      })
    }
    if (isMirror) {
      // Render mirror boards as a satin metallic finish — not a true mirror,
      // to avoid heavy scene reflections while retaining the mirror colour.
      return new THREE.MeshStandardMaterial({
        color: baseColor,
        map: null,
        roughness: 0.5,
        metalness: 0.35,
        envMapIntensity: 0.1,
      })
    }
    // woodgrain / foil / linear / peen / default
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      map,
      roughness: isWood ? (map ? 0.65 : 0.7) : 0.5,
      metalness: isWood ? 0.03 : 0.05,
      envMapIntensity: 0.25,
    })
  }, [color, texture])

  return material
}

// Note: procedural wood texture has been replaced by real board-photo maps.

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

// Nice handle — brushed-steel bar (horizontal or vertical) with mounting posts
// Panels face +z; the handle sits on the front of the panel.
function Handle({ position, direction = 'horizontal', length = 0.28, barRadius = 0.008, postOffset = 0.045 }) {
  const isVertical = direction === 'vertical'
  // CylinderGeometry's length axis is Y by default, so rotate only for horizontal bars.
  const barRotation = isVertical ? [0, 0, 0] : [0, 0, Math.PI / 2]
  const halfLen = length / 2

  // Post positions along the bar axis (x for horizontal, y for vertical)
  const postA = isVertical ? [0, -halfLen * 0.7, 0] : [-halfLen * 0.7, 0, 0]
  const postB = isVertical ? [0, halfLen * 0.7, 0] : [halfLen * 0.7, 0, 0]

  return (
    <group position={position}>
      {/* mounting posts: connect panel (+z) to the bar */}
      {[postA, postB].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[barRadius * 0.7, barRadius * 0.7, postOffset]} />
          <meshStandardMaterial color="#B9B9B9" metalness={0.95} roughness={0.18} />
        </mesh>
      ))}
      {/* the handle bar */}
      <mesh position={[0, 0, postOffset]} rotation={barRotation} castShadow>
        <cylinderGeometry args={[barRadius, barRadius, length, 24]} />
        <meshStandardMaterial color="#D8D8D8" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Base cabinet with recessed front door, plinth and bar handle
function BaseCabinet({ position, size, color, rotation = [0, 0, 0], doorSide = 'front' }) {
  const material = useBoardMaterial(color)
  const [w, h, d] = size
  const frontZ = doorSide === 'front' ? d / 2 : -d / 2
  return (
    <group position={position} rotation={rotation}>
      {/* carcass */}
      <RoundedBox args={size} radius={0.015} smoothness={4} material={material} castShadow receiveShadow />
      {/* door front (recessed) */}
      <mesh position={[0, 0, frontZ + 0.005]} material={material} castShadow>
        <boxGeometry args={[w * 0.92, h * 0.85, 0.02]} />
      </mesh>
      {/* handle on door */}
      <Handle position={[0, h * 0.28, frontZ + 0.02]} length={Math.min(w * 0.4, 0.3)} />
      {/* plinth */}
      <mesh position={[0, -h / 2 + 0.04, 0]} material={material}>
        <boxGeometry args={[w, 0.08, d - 0.06]} />
      </mesh>
    </group>
  )
}

// Drawer bank — a stack of drawers with recessed fronts and handles
function DrawerBank({ position, size, color, rotation = [0, 0, 0], drawers = 3, doorSide = 'front' }) {
  const material = useBoardMaterial(color)
  const [w, h, d] = size
  const frontZ = doorSide === 'front' ? d / 2 : -d / 2
  const dh = h / drawers
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.012} smoothness={3} material={material} castShadow receiveShadow />
      {Array.from({ length: drawers }).map((_, i) => {
        const y = -h / 2 + dh / 2 + i * dh + (h - dh * drawers) / 2 + 0
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh position={[0, 0, frontZ + 0.005]} material={material} castShadow>
              <boxGeometry args={[w * 0.94, dh * 0.86, 0.02]} />
            </mesh>
            <Handle position={[0, dh * 0.18, frontZ + 0.02]} length={Math.min(w * 0.4, 0.3)} />
            {/* drawer divider shadow gap */}
            <mesh position={[0, dh / 2, frontZ + 0.001]}>
              <boxGeometry args={[w, 0.012, 0.01]} />
              <meshStandardMaterial color="#0e0e0e" roughness={0.9} />
            </mesh>
          </group>
        )
      })}
      {/* plinth */}
      <mesh position={[0, -h / 2 + 0.04, 0]} material={material}>
        <boxGeometry args={[w, 0.08, d - 0.06]} />
      </mesh>
    </group>
  )
}

// Tall cupboard — full-height unit with doors (single or double)
function TallCabinet({ position, size, color, rotation = [0, 0, 0], doubleDoor = true, doorSide = 'front' }) {
  const material = useBoardMaterial(color)
  const [w, h, d] = size
  const frontZ = doorSide === 'front' ? d / 2 : -d / 2
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.02} smoothness={4} material={material} castShadow receiveShadow />
      {doubleDoor ? (
        <>
          <mesh position={[-w * 0.235, 0, frontZ + 0.005]} material={material} castShadow>
            <boxGeometry args={[w * 0.46, h * 0.9, 0.02]} />
          </mesh>
          <mesh position={[w * 0.235, 0, frontZ + 0.005]} material={material} castShadow>
            <boxGeometry args={[w * 0.46, h * 0.9, 0.02]} />
          </mesh>
          {/* vertical bar handles on inner edges */}
          <Handle position={[-w * 0.08, 0, frontZ + 0.02]} direction="vertical" length={h * 0.42} />
          <Handle position={[w * 0.08, 0, frontZ + 0.02]} direction="vertical" length={h * 0.42} />
        </>
      ) : (
        <>
          <mesh position={[0, 0, frontZ + 0.005]} material={material} castShadow>
            <boxGeometry args={[w * 0.94, h * 0.9, 0.02]} />
          </mesh>
          {/* vertical bar handle */}
          <Handle position={[0, 0, frontZ + 0.02]} direction="vertical" length={h * 0.42} />
        </>
      )}
    </group>
  )
}

// Wall-mounted cabinet — shallower, lighter
function WallCabinet({ position, size, color, rotation = [0, 0, 0] }) {
  const material = useBoardMaterial(color)
  const [w, h, d] = size
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={size} radius={0.012} smoothness={3} material={material} castShadow receiveShadow />
      <mesh position={[0, 0, d / 2 + 0.005]} material={material} castShadow>
        <boxGeometry args={[w * 0.94, h * 0.9, 0.02]} />
      </mesh>
      {/* under-rail handle */}
      <Handle position={[0, -h / 2 + 0.06, d / 2 + 0.02]} length={Math.min(w * 0.4, 0.3)} />
    </group>
  )
}

// Kitchen scene — base units, drawer banks, tall cupboards and an island
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

      {/* ─── Back wall ─── */}
      {/* Tall pantry / fridge housing at far left */}
      <TallCabinet position={[-3.6, 0.9, -3]} size={[1.0, 2.6, 0.65]} color={selectedColor} doubleDoor />
      {/* Base cabinet with door */}
      <BaseCabinet position={[-2.3, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      {/* Sink base cabinet (still a cabinet in appearance) */}
      <BaseCabinet position={[-1.0, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      {/* Drawer bank between sink and stove */}
      <DrawerBank position={[0.3, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} drawers={3} />
      {/* Stove base (oven look via glass front below) */}
      <BaseCabinet position={[1.8, 0, -3]} size={[1.2, 0.9, 0.6]} color={selectedColor} />
      {/* Wall cabinets above base units (not over stove) */}
      <WallCabinet position={[-2.3, 2.2, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      <WallCabinet position={[-1.0, 2.2, -3]} size={[1.2, 0.7, 0.35]} color={selectedColor} />
      {/* Countertop — wraps over cabinets, with a space for sink/stove */}
      <mesh position={[-0.25, 0.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[5.3, 0.05, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
      </mesh>

      {/* ─── Left wall ─── */}
      {/* Fridge tall cabinet at top of left wall */}
      <TallCabinet position={[-4.6, 0.9, -1.9]} size={[1.0, 2.6, 0.65]} color={selectedColor} doubleDoor rotation={[0, Math.PI / 2, 0]} />
      {/* Base cabinets along left wall */}
      <BaseCabinet position={[-4.5, 0, -0.4]} size={[1.1, 0.9, 0.6]} color={selectedColor} rotation={[0, Math.PI / 2, 0]} />
      <DrawerBank position={[-4.5, 0, 0.85]} size={[1.2, 0.9, 0.6]} color={selectedColor} drawers={3} rotation={[0, Math.PI / 2, 0]} />
      {/* Countertop continuation on left wall */}
      <mesh position={[-4.5, 0.5, 0.1]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.05, 0.65]} />
        <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
      </mesh>

      {/* Island */}
      <group position={[0.4, 0, 1.6]}>
        <DrawerBank position={[0, 0, 0]} size={[2.6, 0.9, 1.3]} color={selectedColor} drawers={3} />
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.05, 1.45]} />
          <meshStandardMaterial map={countertopTexture} roughness={0.2} metalness={0.25} />
        </mesh>
      </group>

      {/* Sink on back wall counter */}
      <group position={[-1.0, 0.55, -3]}>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.13, 0.5]} />
          <meshStandardMaterial color="#5a5a5a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Faucet */}
        <mesh position={[0, 0.22, -0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.37, -0.1]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.95} roughness={0.08} />
        </mesh>
      </group>

      {/* Stove on back wall counter */}
      <group position={[1.8, 0.55, -3]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.04, 0.6]} />
          <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Burners */}
        {[[-0.3, -0.15], [0.3, -0.15], [-0.3, 0.15], [0.3, 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.025, z]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Range Hood over stove */}
      <group position={[1.8, 2.6, -3]}>
        <mesh castShadow>
          <boxGeometry args={[1.05, 0.4, 0.5]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.85, 0.15, 0.4]} />
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Pendant Lights over island — warm glow */}
      <group position={[0.4, 2.5, 1.6]}>
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

      {/* Under-cabinet lighting on back wall */}
      <pointLight position={[-1.6, 1.8, -2.85]} intensity={0.4} color="#fff8e8" distance={4} />

      {/* Window — subtle ambient */}
      <group position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.1, 1.6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.9, 1.4]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#0a0a1e" emissiveIntensity={0.15} />
        </mesh>
      </group>
    </group>
  )
}