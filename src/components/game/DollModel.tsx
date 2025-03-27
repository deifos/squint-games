import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface DollModelProps {
  isLookingAtPlayer: boolean;
}

export function DollModel({ isLookingAtPlayer }: DollModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/character.glb');
  
  // Apply initial setup to the model
  useEffect(() => {
    if (scene) {
      // Center the model if needed
      scene.position.set(0, 0, 0);
      
      // Apply materials settings if needed
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            // Ensure materials catch light properly
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material.roughness !== undefined) {
              material.roughness = 0.7;
              material.metalness = 0.3;
            }
          }
        }
      });
    }
  }, [scene]);
  
  // Target rotation values
  const targetRotation = isLookingAtPlayer ? 0 : Math.PI; // 0 for front, PI for back
  
  // Smoothly animate rotation when the doll turns
  useFrame((state, delta) => {
    if (group.current) {
      // Smoothly interpolate to target rotation
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetRotation,
        delta * 2 // Adjust speed of rotation
      );
      
      // Add subtle idle animation
      const time = state.clock.getElapsedTime();
      group.current.position.y = Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        scale={1.5} 
        position={[0, -1, 0]} 
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/character.glb');
