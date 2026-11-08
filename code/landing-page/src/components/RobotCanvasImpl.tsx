"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

interface RobotModelProps {
  scrollProgress: number; // 0.0 to 1.0
  showHotspots?: boolean;
}

// Note: The procedural 3D CareWatch and CarePendant placeholders have been removed.
// The photorealistic transparent exploded smartwatch layer (WatchHeroLayer.tsx)
// is rendered at z-[5] directly behind the 3D robot model in HeroScrollSection.tsx.

function RobotModel({ scrollProgress }: RobotModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const robotRootRef = useRef<THREE.Group>(null);

  // Load the GLB model from public path
  const { scene } = useGLTF("/models/robot_model.glb");

  // Clone scene so multiple mounts or reloads are safe
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Apply strict Apple-grade industrial design materials
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = mesh.name.toLowerCase();

        // 1. Brushed White Aluminium Shell (#F8F9FA, roughness 0.28, metalness 0.15)
        if (
          name.includes("torso") ||
          name.includes("shell") ||
          name.includes("bodywhite") ||
          name.includes("head_casing") ||
          name.includes("head_rear_cover") ||
          name.includes("alcove_inner")
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#F8F9FA"),
            roughness: 0.28,
            metalness: 0.15,
            envMapIntensity: 1.15,
          });
        }
        // 2. Slate blue-grey architectural accents (#5B6B7E)
        else if (
          name.includes("extrusion") ||
          name.includes("bracket") ||
          name.includes("chassis") ||
          name.includes("cleat") ||
          name.includes("wheel") ||
          name.includes("track") ||
          name.includes("rearbay") ||
          name.includes("cutout")
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#5B6B7E"),
            roughness: 0.36,
            metalness: 0.32,
            envMapIntensity: 0.95,
          });
        }
        // 3. Screen Face Glass (Glossy Piano-Black)
        else if (name.includes("screen") || name.includes("glass")) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#080A0D"),
            roughness: 0.08,
            metalness: 0.82,
            transmission: 0.3,
            transparent: true,
            opacity: 0.96,
            envMapIntensity: 1.4,
          });
        }
        // 4. Emissive Eyes & Mouth (Warm modern cyan/white glow)
        else if (name.includes("eye") || name.includes("mouth") || name.includes("face")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#6EE7B7"),
            emissive: new THREE.Color("#34D399"),
            emissiveIntensity: 2.2,
            roughness: 0.2,
          });
        }
        // 5. Stainless Steel Tray (Roughness 0.18, Metalness 0.92)
        else if (name.includes("stainless") || name.includes("tray") || name.includes("nozzle")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#E2E8F0"),
            roughness: 0.18,
            metalness: 0.92,
            envMapIntensity: 1.2,
          });
        }
        // 6. Translucent Blue Hydration Sports Bottle
        else if (name.includes("water_bottle") || name.includes("bottle_caddy")) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color("#38BDF8"),
            roughness: 0.15,
            metalness: 0.05,
            transmission: 0.78,
            transparent: true,
            opacity: 0.88,
            ior: 1.45,
          });
        }
        // 7. Laser-engraved ALVI wordmark
        else if (name.includes("alvi")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#5B6B7E"),
            roughness: 0.3,
            metalness: 0.6,
          });
        }
        // 8. Emergency Stop Switch
        else if (name.includes("emergency")) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#EF4444"),
            roughness: 0.3,
            metalness: 0.1,
          });
        }
      }
    });

    return clone;
  }, [scene]);

  // Handle responsive sizing
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Frame update: Smooth damped scroll choreography
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (!robotRootRef.current) return;

    // Two-Stage Choreography:
    // Stage 1 (0.00 -> 0.38): Robot moves from center (X=0) to final position (X=0.64)
    // Stage 2 (0.38 -> 1.00): Robot remains settled in its final position while watch explodes
    const TRANSITION_END = 0.38;

    let targetRobotX = 0;
    let targetRobotY = -0.68;
    let targetRobotZ = 0;
    let targetRobotRotY = 0;
    let targetRobotRotX = 0;

    if (scrollProgress <= 0) {
      targetRobotX = 0;
      targetRobotY = -0.68 + Math.sin(time * 0.9) * 0.015;
      targetRobotRotY = Math.sin(time * 0.5) * 0.04;
      targetRobotRotX = 0.02;
    } else if (scrollProgress < TRANSITION_END) {
      const p = Math.min(1, Math.max(0, scrollProgress / TRANSITION_END));
      const easeP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      targetRobotX = isMobile ? 0 : 0.64 * easeP;
      targetRobotY = -0.68 + 0.05 * easeP;
      targetRobotRotY = -0.48 * easeP + Math.sin(time * 0.5) * 0.02;
      targetRobotRotX = 0.02 * (1 - easeP) + 0.06 * easeP;
    } else {
      // Final position reached: hold steady on the right
      targetRobotX = isMobile ? 0 : 0.64;
      targetRobotY = -0.68 + 0.05;
      targetRobotRotY = -0.48 + Math.sin(time * 0.5) * 0.012;
      targetRobotRotX = 0.06;
    }

    const lerpFactor = Math.min(1, delta * 3.2);
    robotRootRef.current.position.x = THREE.MathUtils.lerp(
      robotRootRef.current.position.x,
      targetRobotX,
      lerpFactor
    );
    robotRootRef.current.position.y = THREE.MathUtils.lerp(
      robotRootRef.current.position.y,
      targetRobotY,
      lerpFactor
    );
    robotRootRef.current.position.z = THREE.MathUtils.lerp(
      robotRootRef.current.position.z,
      targetRobotZ,
      lerpFactor
    );
    robotRootRef.current.rotation.y = THREE.MathUtils.lerp(
      robotRootRef.current.rotation.y,
      targetRobotRotY,
      lerpFactor
    );
    robotRootRef.current.rotation.x = THREE.MathUtils.lerp(
      robotRootRef.current.rotation.x,
      targetRobotRotX,
      lerpFactor
    );
  });

  return (
    <group ref={groupRef}>
      {/* 1. Primary ALVI Autonomous Indoor Robot (.glb Model) */}
      <group
        ref={robotRootRef}
        position={[0, -0.68, 0]}
        scale={isMobile ? 0.86 : 1.08}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Soft Contact Shadows on Floor */}
      <ContactShadows
        position={[0, -0.68, 0]}
        opacity={0.3}
        scale={3.8}
        blur={2.4}
        far={1.8}
        color="#5B6B7E"
      />
    </group>
  );
}

export function RobotCanvasImpl({ scrollProgress }: RobotModelProps) {
  return (
    <div
      className="w-full h-full relative"
      aria-label="ALVICARE 3D Interactive Canvas"
    >
      <Canvas
        camera={{ position: [0, 0.26, 2.45], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        {/* Apple Studio Lighting */}
        <ambientLight intensity={0.95} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.35}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-4, 3, -3]}
          intensity={0.6}
          color="#B8C4D0"
        />
        <directionalLight
          position={[0, -2, 2]}
          intensity={0.25}
          color="#FFFFFF"
        />

        <Environment preset="studio" />

        <RobotModel scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
