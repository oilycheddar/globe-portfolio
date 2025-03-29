"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useThemeStore } from '../hooks/useThemeStore'

interface Logo3DProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo3D({ className = '', style }: Logo3DProps) {
  const { theme } = useThemeStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={{ 
        filter: `drop-shadow(var(--${theme}_shadow))`,
        aspectRatio: '692/346',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}
    >
      <Canvas 
        camera={{ 
          position: [0, 0, 10],
          fov: 30,
          aspect: 2
        }}
        style={{ 
          width: '100%',
          height: '100%',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <Globe mousePosition={mousePosition} theme={theme} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}

interface GlobeProps {
  mousePosition: { x: number; y: number }
  theme: string
}

function Globe({ mousePosition, theme }: GlobeProps) {
  const mouseEnabled = false
  const meshRef = useRef<THREE.Mesh>(null)
  const targetRotation = useRef({ x: 0, y: 0 })
  const time = useRef(0)

  useFrame((state, delta) => {
    time.current += delta

    if (meshRef.current) {
      const baseRotation = -time.current * 0.2

      targetRotation.current.y = (mousePosition.x * 0.25 * mouseEnabled) + baseRotation
      targetRotation.current.x = -mousePosition.y * 0.15 * mouseEnabled

      const ambientRotationY = Math.sin(time.current * 0.2) * 0.05
      const ambientRotationX = Math.cos(time.current * 0.15) * 0.03

      meshRef.current.rotation.y += (targetRotation.current.y + ambientRotationY - meshRef.current.rotation.y) * 0.05
      meshRef.current.rotation.x += (targetRotation.current.x + ambientRotationX - meshRef.current.rotation.x) * 0.05

      if (meshRef.current.material instanceof THREE.ShaderMaterial) {
        meshRef.current.material.uniforms.time.value = time.current
      }
    }
  })

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim()) },
      noiseColor: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--logo-noise').trim()) },
      thickness: { value: 0.0286 },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        pos *= vec3(1.401375, 0.7006875, 0.7006875);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 noiseColor;
      uniform float thickness;
      uniform float time;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      const float PI = 3.141592653589793;
      const vec3 scale = vec3(1.401375, 0.7006875, 0.7006875);
      
      // Noise function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec3 p = normalize(vPosition);
        float longitude = atan(p.z, p.x);
        float latitude = acos(p.y);
        
        // Calculate scale-compensated thickness
        float yScale = scale.y / scale.x;
        float zScale = scale.z / scale.x;
        vec3 scaledPos = vec3(p.x, p.y * yScale, p.z * zScale);
        float distortionFactor = length(scaledPos) / length(p);
        float adjustedThickness = thickness * distortionFactor;
        
        float longSpacing = 2.0 * PI / 10.0;
        float longAngle = mod(longitude + PI, longSpacing);
        float longLine = step(longAngle, adjustedThickness) + 
                        step(longSpacing - longAngle, adjustedThickness);
        
        float latSpacing = PI / 6.0;
        float latAngle = mod(latitude, latSpacing);
        float latLine = step(latAngle, adjustedThickness) + 
                       step(latSpacing - latAngle, adjustedThickness);
        
        float lines = min(1.0, longLine + latLine);
        
        // Generate noise
        vec2 noiseUV = vec2(longitude / (2.0 * PI), latitude / PI);
        float noise = random(noiseUV);
        
        // Blend colors
        vec3 finalColor = mix(color, noiseColor, noise * 0.5);
        
        gl_FragColor = vec4(finalColor, lines);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3.5034375, 64, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
} 