import { useThemeStore } from "../hooks/useThemeStore";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
  noiseEnabled?: boolean;
}

function NoiseShader({ opacity }: { opacity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });

    if (!canvas || !gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
        attribute vec2 position;

        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `
    );
    const fragmentShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        precision mediump float;

        float random(vec2 point) {
          return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          float grain = random(floor(gl_FragCoord.xy));
          gl_FragColor = vec4(vec3(grain), 1.0);
        }
      `
    );

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, "position");

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const render = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);
    render();

    return () => {
      resizeObserver.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1}
      height={1}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{
        mixBlendMode: "soft-light",
        opacity,
      }}
    />
  );
}

export default function PageWrapper({ children, noiseEnabled = true }: PageWrapperProps) {
  const { theme } = useThemeStore();
  const innerShapeRef = useRef<HTMLDivElement>(null);
  const noiseOpacity = {
    slime: 0.18,
    water: 0.18,
    acid: 0.5,
    bunny: 0.75,
    dune: 0.5,
  }[theme] ?? 0.18;

  useLayoutEffect(() => {
    if (innerShapeRef.current) {
      const mediaQuery = window.matchMedia('(max-width: 440px)');
      const topValue = mediaQuery.matches ? 'max(16px, env(safe-area-inset-top))' : '16px';

      // Set initial state - bigger size and opacity 0
      gsap.set(innerShapeRef.current, { 
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
        opacity: 0,
        scale: 1.1, // Start 10% bigger
        transformOrigin: 'center center'
      });

      // Animate to final position with scale down
      gsap.to(innerShapeRef.current, { 
        top: topValue,
        right: '16px',
        bottom: '16px',
        left: '16px',
        opacity: 1,
        scale: 1,
        duration: 1.35,
        delay: 0.3,
        ease: "power2.out"
      });

      // Listen for media query changes to update the top offset accordingly
      const updateTop = (e: MediaQueryListEvent | MediaQueryList) => {
        const newTop = e.matches ? 'max(16px, env(safe-area-inset-top))' : '16px';
        gsap.set(innerShapeRef.current, { top: newTop });
      };

      mediaQuery.addEventListener('change', updateTop);
      return () => mediaQuery.removeEventListener('change', updateTop);
    }
  }, []);

  return (
    <div className="fixed w-screen h-screen flex items-center justify-center bg-[var(--color-bg)] p-0">
      {/* Inner Shape (Lighter Page Content) */}
      <div ref={innerShapeRef} className="fixed bg-[var(--color-page-content)] rounded-[20px] overflow-hidden">
        {noiseEnabled && <NoiseShader opacity={noiseOpacity} />}
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

