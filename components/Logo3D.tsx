"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useThemeStore } from '../hooks/useThemeStore'

interface Logo3DProps {
  className?: string;
  style?: React.CSSProperties;
}

function Globe({ theme }: { theme: string }) {
  const meshRef = useRef<THREE.Group>(null)
  const time = useRef(0)

  // Create geometries
  const outerGeometry = new THREE.SphereGeometry(3.5034375, 64, 32)
  const innerGeometry = new THREE.SphereGeometry(3.4534375, 64, 32)
  
  // Apply ellipsoid scaling
  const scale = new THREE.Matrix4().makeScale(1.401375, 0.7006875, 0.7006875)
  outerGeometry.applyMatrix4(scale)
  innerGeometry.applyMatrix4(scale)

  // Load the decal texture
  const decalTexture = useTexture('/GEORGE.png')
  decalTexture.minFilter = THREE.NearestFilter
  decalTexture.magFilter = THREE.NearestFilter

  // Create outer material with grid lines and noise
  const outerMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim()) },
      noiseColor: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--logo-noise').trim()) },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 noiseColor;
      uniform float time;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      const float PI = 3.141592653589793;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      bool isInLogoArea(vec2 uv) {
        float padding = 0.05;
        
        vec2 center1 = vec2(0.7, 0.5);  // Front window
        vec2 center2 = vec2(0.2, 0.5);  // Back window
        vec2 size = vec2(0.533, 0.533) * 0.2;
        
        vec2 dist1 = abs(uv - center1);
        vec2 dist2 = abs(uv - center2);
        
        return (dist1.x < size.x + padding && dist1.y < size.y + padding) ||
               (dist2.x < size.x + padding && dist2.y < size.y + padding);
      }
      
      void main() {
        vec3 p = normalize(vPosition);
        float longitude = atan(p.z, p.x);
        float latitude = asin(p.y);
        
        // Check if we're in the logo area
        if (isInLogoArea(vUv)) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
        
        // Grid lines
        float longSpacing = 2.0 * PI / 10.0;
        float latSpacing = PI / 3.0;
        
        float thickness = 0.0286 * 1.2;
        
        float longAngle = mod(longitude + PI, longSpacing);
        float latAngle = mod(latitude + PI/2.0, latSpacing);
        
        float longLine = step(longAngle, thickness) + step(longSpacing - longAngle, thickness);
        float latLine = step(latAngle, thickness) + step(latSpacing - latAngle, thickness);
        
        float lines = min(1.0, longLine + latLine);
        
        // Noise effect
        vec2 noiseUV = vec2(longitude / (2.0 * PI), latitude / PI);
        float noise = random(noiseUV + vec2(time * 0.1));
        
        vec3 finalColor = mix(color, noiseColor, noise * 0.5);
        
        gl_FragColor = vec4(finalColor, lines);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  })

  // Create decal material
  const decalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim()) },
      noiseColor: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--logo-noise').trim()) },
      mainTex: { value: decalTexture },
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform vec3 noiseColor;
      uniform sampler2D mainTex;
      uniform float time;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec4 texColor = texture2D(mainTex, vUv);
        float noise = random(vUv + vec2(time * 0.1));
        
        if (texColor.a > 0.0) {
          vec3 finalColor = mix(color, noiseColor, noise * 0.5);
          gl_FragColor = vec4(finalColor, texColor.a);
        } else {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  })

  useFrame((state, delta) => {
    time.current += delta

    if (meshRef.current) {
      // Base rotation
      const baseRotation = -time.current * 0.2

      // Ambient motion
      const ambientRotationY = Math.sin(time.current * 0.2) * 0.05
      const ambientRotationX = Math.cos(time.current * 0.15) * 0.03

      meshRef.current.rotation.y = baseRotation + ambientRotationY
      meshRef.current.rotation.x = ambientRotationX

      // Update shader uniforms
      outerMaterial.uniforms.time.value = time.current
      decalMaterial.uniforms.time.value = time.current
    }
  })

  return (
    <group ref={meshRef}>
      {/* Single ellipsoid with window effect */}
      <mesh geometry={outerGeometry} material={outerMaterial} />
      
      {/* Front decal */}
      <mesh
        position={[0, 0, 3.5034375 * 0.7006875]}
        scale={[5, 0.66625, 5]}
      >
        <planeGeometry />
        <primitive object={decalMaterial} attach="material" />
      </mesh>
      
      {/* Back decal */}
      <mesh
        position={[0, 0, -3.5034375 * 0.7006875]}
        rotation={[0, Math.PI, 0]}
        scale={[5, 0.66625, 5]}
      >
        <planeGeometry />
        <primitive object={decalMaterial} attach="material" />
      </mesh>
    </group>
  )
}

export default function Logo3D({ className = '', style }: Logo3DProps) {
  const { theme } = useThemeStore()

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
        <Globe theme={theme} />
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