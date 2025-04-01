"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useThemeStore } from '../hooks/useThemeStore'
import styled from "styled-components"
import { Suspense } from "react"
import { useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"

interface Logo3DProps {
  className?: string;
  style?: React.CSSProperties;
  noiseEnabled?: boolean;
}

/**
 * 3D Logo component that renders an animated ellipsoid with grid lines and decals.
 * 
 * Note: Parent containers must have `overflow: visible` or `overflow-visible` 
 * class to prevent the 3D content from being clipped.
 * 
 * Usage example:
 * <div className="overflow-visible">
 *   <Logo3D />
 * </div>
 */

function Globe({ theme, noiseEnabled }: { theme: string; noiseEnabled: boolean }) {
  const meshRef = useRef<THREE.Group>(null)
  const time = useRef(0)

  // Create geometries
  const outerGeometry = new THREE.SphereGeometry(3.5034375, 64, 32)
  const innerGeometry = new THREE.SphereGeometry(3.4534375, 64, 32)
  const coreGeometry = new THREE.SphereGeometry(3.4034375, 64, 32)
  
  // Apply ellipsoid scaling
  const scale = new THREE.Matrix4().makeScale(1.401375, 0.7006875, 0.7006875)
  outerGeometry.applyMatrix4(scale)
  innerGeometry.applyMatrix4(scale)
  coreGeometry.applyMatrix4(scale)

  // Load texture with error handling
  const decalTexture = useLoader(TextureLoader, '/GEORGE.png')
  decalTexture.minFilter = THREE.NearestFilter
  decalTexture.magFilter = THREE.NearestFilter

  // Create outer material with grid lines and noise
  const outerMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { 
        value: new THREE.Color().setStyle(theme === 'slime' ? '#C1DF1E' : 
               theme === 'water' ? '#E6D6FB' :
               theme === 'acid' ? '#6321EE' :
               theme === 'bunny' ? '#DF1E9B' :
               '#0822A3') // dune
      },
      time: { value: 0 },
      noiseEnabled: { value: noiseEnabled },
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
      uniform float time;
      uniform bool noiseEnabled;
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
        vec2 size = vec2(0.533, 0.25) * 0.2;
        
        vec2 dist1 = abs(uv - center1);
        vec2 dist2 = abs(uv - center2);
        
        return (dist1.x < size.x + padding && dist1.y < size.y + padding) ||
               (dist2.x < size.x + padding && dist2.y < size.y + padding);
      }
      
      vec3 softLight(vec3 base, float blend) {
        vec3 lightness = vec3(1.0) - 2.0 * (1.0 - base) * (1.0 - vec3(blend));
        vec3 darkness = vec3(2.0 * base * blend);
        return mix(darkness, lightness, base);
      }
      
      void main() {
        vec3 p = normalize(vPosition);
        float longitude = atan(p.z, p.x);
        float latitude = vUv.y * PI;
        
        // Check if we're in the logo area
        if (isInLogoArea(vUv)) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
        
        // Grid lines
        float longSpacing = 2.0 * PI / 10.0;
        float latSpacing = PI / 3.0;
        
        float thickness = 0.0286 * 1.7;
        
        float longAngle = mod(longitude + PI, longSpacing);
        float latAngle = mod(latitude, latSpacing);
        
        float longLine = step(longAngle, thickness) + step(longSpacing - longAngle, thickness);
        float latLine = step(latAngle, thickness) + step(latSpacing - latAngle, thickness);
        
        float lines = min(1.0, longLine + latLine);
        
        // Noise effect with larger scale
        vec2 noiseUV = vec2(longitude / (2.0 * PI), latitude / PI) * 0.5;
        float noise = noiseEnabled ? random(noiseUV + vec2(time * 0.1)) : 0.5;
        
        vec3 finalColor = color;
        // Apply soft light blend with noise
        finalColor = softLight(finalColor, noise);
        
        float opacity = mix(0.0, lines, smoothstep(0.0, 1.0, gl_FragCoord.z));
        
        // Convert from linear to sRGB space
        finalColor = pow(finalColor, vec3(1.0/2.2));
        
        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
  })

  // Create decal material
  const decalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { 
        value: new THREE.Color().setStyle(theme === 'slime' ? '#C1DF1E' : 
               theme === 'water' ? '#E6D6FB' :
               theme === 'acid' ? '#6321EE' :
               theme === 'bunny' ? '#DF1E9B' :
               '#0822A3') // dune
      },
      mainTex: { value: decalTexture },
      time: { value: 0 },
      noiseEnabled: { value: noiseEnabled },
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
      uniform float time;
      uniform sampler2D mainTex;
      uniform bool noiseEnabled;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      vec3 softLight(vec3 base, float blend) {
        vec3 lightness = vec3(1.0) - 2.0 * (1.0 - base) * (1.0 - vec3(blend));
        vec3 darkness = vec3(2.0 * base * blend);
        return mix(darkness, lightness, base);
      }
      
      void main() {
        vec4 texColor = texture2D(mainTex, vUv);
        float noise = noiseEnabled ? random(vUv + vec2(time * 0.1)) : 0.5;
        
        if (texColor.a > 0.0) {
          vec3 finalColor = color;
          // Apply soft light blend with noise
          finalColor = softLight(finalColor, noise);
          
          // Convert from linear to sRGB space
          finalColor = pow(finalColor, vec3(1.0/2.2));
          gl_FragColor = vec4(finalColor, texColor.a);
        } else {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: true,
    depthTest: true,
  })

  // Create core material
  const coreMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
  })

  useFrame((state, delta) => {
    time.current += delta

    if (meshRef.current) {
      // Base rotation
      const baseRotation = -time.current * 0.2

      // Ambient motion - only horizontal
      const ambientRotationY = Math.sin(time.current * 0.2) * 0.05

      // Apply only horizontal rotation
      meshRef.current.rotation.y = baseRotation + ambientRotationY
      meshRef.current.rotation.x = 0  // Keep it level by setting to 0

      // Update shader uniforms
      outerMaterial.uniforms.time.value = time.current
      outerMaterial.uniforms.noiseEnabled.value = noiseEnabled
      decalMaterial.uniforms.time.value = time.current
      decalMaterial.uniforms.noiseEnabled.value = noiseEnabled
    }
  })

  return (
    <group ref={meshRef}>
      {/* Inner sphere for depth only */}
      <mesh geometry={innerGeometry} material={coreMaterial} />
      
      {/* Outer ellipsoid with window effect */}
      <mesh geometry={outerGeometry} material={outerMaterial} />
      
      {/* Front decal */}
      <mesh
        position={[0, 0, 3.5034375 * 0.7006875]}
        scale={[5 * 1.325, 0.66625 * 1.25, 5 * 1.25]}
      >
        <planeGeometry />
        <primitive object={decalMaterial} attach="material" />
      </mesh>
      
      {/* Back decal */}
      <mesh
        position={[0, 0, -3.5034375 * 0.7006875]}
        rotation={[0, Math.PI, 0]}
        scale={[5 * 1.325, 0.66625 * 1.15, 5 * 1.15]}
      >
        <planeGeometry />
        <primitive object={decalMaterial} attach="material" />
      </mesh>
    </group>
  )
}

// Wrap the Globe component in error boundaries
function GlobeWithErrorHandling(props: { theme: string; noiseEnabled: boolean }) {
  return (
    <Suspense fallback={null}>
      <Globe {...props} />
    </Suspense>
  )
}

export default function Logo3D({ className = '', style, noiseEnabled = true }: Logo3DProps) {
  const { theme } = useThemeStore()
  const logoRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      ref={logoRef}
      className={`w-full overflow-visible ${className}`}
      style={{ 
        filter: `drop-shadow(var(--${theme}_shadow))`,
        aspectRatio: '2/1',
        position: 'relative',
        overflow: 'visible',
        ...style
      }}
    >
      <Canvas 
        camera={{ 
          position: [0, 0, 10],
          fov: 31,
          aspect: 2
        }}
        style={{ 
          width: '100%',
          height: '100%',
          overflow: 'visible',
          position: 'relative',
          isolation: 'isolate',
          contain: 'none',
          display: 'block', // Ensure proper block layout
          pointerEvents: 'none' // Disable pointer events on the canvas
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true 
        }}
      >
        <GlobeWithErrorHandling theme={theme} noiseEnabled={noiseEnabled} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          enableRotate={true}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          domElement={document.documentElement} // Attach controls to document root
        />
      </Canvas>
    </div>
  )
}

const BlurWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: filter 0.4s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  ...
`;

const StyledContent = styled.div`
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --navbar-height: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  transition: filter 0.4s ease;
  overflow: visible;
  ...
`; 