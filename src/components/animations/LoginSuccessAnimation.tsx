
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[0.8, 64, 64]} position={position}>
        <MeshDistortMaterial
          color="#8B5CF6"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const FloatingEmojis: React.FC = () => {
  const emojis = ['🕶️', '👻', '🔮', '✨', '🎭', '🌟'];
  
  const positions = useMemo(() => 
    Array.from({ length: 6 }, () => [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5
    ] as [number, number, number]
  ), []);

  return (
    <>
      {emojis.map((emoji, index) => (
        <Float key={index} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <Text
            position={positions[index]}
            fontSize={1}
            color="#A855F7"
            anchorX="center"
            anchorY="middle"
          >
            {emoji}
          </Text>
        </Float>
      ))}
    </>
  );
};

const UnderCoverText: React.FC = () => {
  const textRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={textRef}>
      <Text
        position={[0, 1, 0]}
        fontSize={1.5}
        color="#8B5CF6"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        🕶️ UnderCover
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.5}
        color="#A855F7"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to the shadows...
      </Text>
    </group>
  );
};

interface LoginSuccessAnimationProps {
  onComplete: () => void;
}

const LoginSuccessAnimation: React.FC<LoginSuccessAnimationProps> = ({ onComplete }) => {
  const spherePositions: [number, number, number][] = [
    [-3, 2, -2],
    [3, -1, -1],
    [-2, -2, 1],
    [4, 1, 0]
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <UnderCoverText />
        <FloatingEmojis />
        
        {spherePositions.map((position, index) => (
          <AnimatedSphere key={index} position={position} />
        ))}
      </Canvas>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-purple-400">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Entering the underground...</span>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessAnimation;
