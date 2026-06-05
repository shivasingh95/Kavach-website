"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Suppress the upstream r3f v8 THREE.Clock deprecation warning —
// it's emitted from inside @react-three/fiber and can't be fixed
// without upgrading to r3f v9+.
if (typeof window !== "undefined") {
  const _warn = console.warn.bind(console);
  console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    _warn(...args);
  };
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(3000);
    for (let i = 0; i < arr.length; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 1.5;
      arr[i] = r * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = r * Math.cos(phi);
      arr[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f0ff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingRings() {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2.2, 0.015, 16, 100]} />
      <meshBasicMaterial color="#7c3aed" transparent opacity={0.4} />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      // Cap DPR at 1.5 — higher values cause GPU memory pressure → context loss
      dpr={[1, 1.5]}
      gl={{
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        antialias: false, // Reduces GPU load significantly on particle-heavy scenes
      }}
      onCreated={({ gl }) => {
        // Allow browser to recover the context instead of dying silently
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          console.warn("[Scene3D] WebGL context lost — will attempt restore");
        });
        gl.domElement.addEventListener("webglcontextrestored", () => {
          console.info("[Scene3D] WebGL context restored");
        });
      }}
    >
      <ambientLight intensity={0.5} />
      <ParticleField />
      <FloatingRings />
    </Canvas>
  );
}
