'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Preload, 
  useProgress,
  Html
} from '@react-three/drei';
import { Loader2 } from 'lucide-react';

// Progress loader component
function ModelLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-primary">{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  )
}

type ModelProps = {
  modelUrl: string;
};

function Model({ modelUrl }: ModelProps) {
  const modelRef = useRef(null);
  const { scene } = useGLTF(modelUrl, true);

  useEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.geometry) {
            child.geometry.dispose();
          }
        }
      });
    }
  }, [scene]);

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={2.0} 
      position={[0, -2, -2]}
      dispose={null}
    />
  );
}

export default function ThreeDmodel() {
  const [mounted, setMounted] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadModel = async () => {
      try {
        const directModelUrl = 'https://r2.sdmcetinsignia.com/models/sdm.glb';
        await useGLTF.preload(directModelUrl);
        setModelUrl(directModelUrl);
        setIsReady(true);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load 3D model');
      }
    };

    loadModel();

    return () => {
      if (modelUrl) {
        useGLTF.clear(modelUrl);
      }
    };
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return null;
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <section className="relative w-full h-screen bg-transparent">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 2, 15], fov: 60 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          gl={{ 
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[20, 20, 15]} intensity={0.6} />
          
          <Suspense fallback={<ModelLoader />}>
            {modelUrl && isReady && <Model modelUrl={modelUrl} />}
            <Environment preset="city" environmentIntensity={0.5} />
            <Preload all />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.4}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 2.1}
            makeDefault
          />
        </Canvas>
      </div>
    </section>
  );
}
