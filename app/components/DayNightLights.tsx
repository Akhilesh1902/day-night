"use client";

import { Helper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";

export default function DayNightLightSingle() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const timeRef = useRef(0);

  // Define color palette
  const colors = {
    noon: new THREE.Color(0xf0dc88),
    dusk: new THREE.Color(0xf3a76e),
  };

  const {
    timeOfDay,
    cycleSpeed,
    autoPlay,
    dayIntensity,
    nightIntensity,
    ambientIntensity,
    dynamicAmbient,
    colorTransitionSpeed,
  } = useControls("Day/Night Cycle", {
    autoPlay: { value: true, label: "Auto Cycle" },
    timeOfDay: {
      value: 0,
      min: 0,
      max: 24,
      step: 0.4,
      label: "Time of Day (Hours)",
    },
    cycleSpeed: {
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Cycle Speed",
    },
    dayIntensity: {
      value: 3.5,
      min: 0,
      max: 10,
      step: 0.1,
      label: "Day Intensity",
    },
    nightIntensity: {
      value: 0.5,
      min: 0,
      max: 5,
      step: 0.1,
      label: "Night Intensity",
    },
    dynamicAmbient: { value: true, label: "Dynamic Ambient Light" },
    ambientIntensity: {
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Ambient Intensity",
    },
    colorTransitionSpeed: {
      value: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      label: "Color Transition Speed",
    },
  });
  const radius = 10;
  const hoursToRadians = (hours: number) =>
    (hours / 24) * Math.PI * 2 - Math.PI / 2;

  useFrame((state, delta) => {
    if (autoPlay) {
      const hourIncrement = (delta * cycleSpeed * 24) / (Math.PI * 2);
      timeRef.current += hourIncrement;
      if (timeRef.current >= 24) timeRef.current = 0;
    } else {
      timeRef.current = timeOfDay;
    }

    const angle = hoursToRadians(timeRef.current) + Math.PI / 2;
    // console.log(angle);
    // Calculate day position
    const dayX = Math.cos(angle) * radius;
    const dayY = Math.abs(Math.sin(angle) * radius);
    // const dayZ = -5;
    const dayZ = Math.sin(angle) * radius;

    // Oscillate between day and night positions
    // For night, use opposite direction
    const sunHeight =
      Math.sin(angle + Math.PI / 2) + Math.sin(angle + Math.PI / 4) * 0.5;
    // const isDay = sunHeight > 0;
    const isDay = true;

    // Set position based on day/night
    if (lightRef.current) {
      if (isDay) {
        lightRef.current.position.set(dayX, dayY, dayZ);
      } else {
        lightRef.current.position.set(-dayX, -dayY, dayZ);
      }

      const dayColor = colors.noon; // bright sunny color
      const duskColor = colors.dusk;

      // Color blending based on sunHeight for smooth transitions
      let targetColor;

      const easeInOutCubic = (x: number) =>
        x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

      if (sunHeight > 0) {
        let t = Math.min(sunHeight * 0.1, 1);
        t = easeInOutCubic(t);
        targetColor = duskColor.clone().lerp(dayColor, t);
      } else {
        targetColor = duskColor.clone();
      }
      lightRef.current.intensity = dayIntensity;

      if (lightRef.current) {
        lightRef.current.color.lerp(targetColor, colorTransitionSpeed);
      }

      lightRef.current.color.lerp(targetColor, colorTransitionSpeed);
    }

    // Dynamic ambient
    if (ambientLightRef.current && dynamicAmbient) {
      if (sunHeight > 0.5) {
        ambientLightRef.current.intensity = ambientIntensity * 2;
      } else if (sunHeight > 0) {
        ambientLightRef.current.intensity = ambientIntensity * 1.5;
      } else {
        ambientLightRef.current.intensity = ambientIntensity * 0.5;
      }
    } else if (ambientLightRef.current) {
      ambientLightRef.current.intensity = ambientIntensity;
    }
  });

  return (
    <>
      {/* Single Directional Light (Sun/Moon as one) */}
      <directionalLight
        ref={lightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}>
        {/* <Helper
          type={THREE.DirectionalLightHelper}
          // @ts-expect-error : Ignore type issue
          // eslint-disable-next-line react-hooks/refs
          args={[lightRef.current]}
        /> */}
      </directionalLight>
      {/* Ambient Light */}
      <ambientLight
        ref={ambientLightRef}
        intensity={ambientIntensity}
      />
    </>
  );
}
