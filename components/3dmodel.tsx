'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

type ModelProps = {
  modelUrl: string;
};

// 👇 Simple Model loader
function Model({ modelUrl }: ModelProps) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={2.0} position={[0, -2, -2]} />; // Adjusted scale and position
}

// 👇 Main HeroSection
export default function ThreeDmodel() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const directModelUrl = 'https://r2.sdmcetinsignia.com/models/SDM2.gltf'; // 👈 Your model URL here
    setModelUrl(directModelUrl);
    setLoading(false);
  }, []);

  return (
    <section className="relative w-full h-screen bg-transparent">
      <div className="absolute inset-0 z-0">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-xl">Loading 3D Model...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 text-xl">{error}</div>
          </div>
        )}
        {modelUrl && (
          <Canvas camera={{ position: [0, 2, 15], fov: 60 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[20, 20, 15]} intensity={0.8} />
            <Suspense fallback={null}>
              <Model modelUrl={modelUrl} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={1}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>
        )}
      </div>
    </section>
  );
}

// THREE loader cache fix
useGLTF.preload('/SDM2.gltf'); // (Optional preload if static model)
