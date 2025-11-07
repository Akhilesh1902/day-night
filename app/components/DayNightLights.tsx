/* eslint-disable @typescript-eslint/no-explicit-any */

import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";

export default function DayNightLights() {
  const dayLightRef = useRef<THREE.DirectionalLight>(null);
  const nightLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const timeRef = useRef(0);

  // Define color palette
  const colors = {
    noon: new THREE.Color(0xffffeb), // Bright white
    day: new THREE.Color(0xfff4e6), // Warm white
    sunset: new THREE.Color(0xffaa55), // Orange
    dusk: new THREE.Color(0xff6600), // Deep orange
    night: new THREE.Color(0x001133), // Very dark blue
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
    autoPlay: {
      value: true,
      label: "Auto Cycle",
    },
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
      value: 2,
      min: 0,
      max: 5,
      step: 0.1,
      label: "Day Intensity",
    },
    nightIntensity: {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.1,
      label: "Night Intensity",
    },
    dynamicAmbient: {
      value: true,
      label: "Dynamic Ambient Light",
    },
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

  useFrame((state, delta) => {
    const hoursToRadians = (hours: number) =>
      (hours / 24) * Math.PI * 2 - Math.PI / 2;

    if (autoPlay) {
      const hourIncrement = (delta * cycleSpeed * 24) / (Math.PI * 2);
      timeRef.current += hourIncrement;

      if (timeRef.current >= 24) {
        timeRef.current = 0;
      }
    } else {
      timeRef.current = timeOfDay;
    }

    const radius = 15;
    const angle = hoursToRadians(timeRef.current);

    const dayX = Math.cos(angle) * radius;
    const dayY = Math.sin(angle) * radius;
    const dayZ = 5;

    const nightX = -dayX;
    const nightY = -dayY;
    const nightZ = dayZ;

    if (dayLightRef.current) {
      dayLightRef.current.position.set(dayX, dayY, dayZ);

      const intensity = Math.max(
        0,
        Math.sin(angle + Math.PI / 2) * dayIntensity
      );
      dayLightRef.current.intensity = intensity;
      // Smooth color transitions using lerp
      const sunHeight = Math.sin(angle + Math.PI / 2);
      let targetColor;

      if (sunHeight > 0.8) {
        // High noon - bright white
        targetColor = colors.noon;
      } else if (sunHeight > 0.5) {
        // Mid-day - lerp between noon and day
        const t = (sunHeight - 0.5) / 0.3;
        targetColor = colors.day.clone().lerp(colors.noon, t);
      } else if (sunHeight > 0.2) {
        // Morning/Afternoon - lerp between day and sunset
        const t = (sunHeight - 0.2) / 0.3;
        targetColor = colors.sunset.clone().lerp(colors.day, t);
      } else if (sunHeight > 0) {
        // Sunset/Sunrise - lerp between dusk and sunset
        const t = sunHeight / 0.2;
        targetColor = colors.dusk.clone().lerp(colors.sunset, t);
      } else if (sunHeight > -0.2) {
        // Twilight - lerp between night and dusk
        const t = (sunHeight + 0.2) / 0.2;
        targetColor = colors.night.clone().lerp(colors.dusk, t);
      } else {
        // Deep night
        targetColor = colors.night;
      }

      // Smoothly interpolate to target color
      dayLightRef.current.color.lerp(targetColor, colorTransitionSpeed);
    }

    if (nightLightRef.current) {
      nightLightRef.current.position.set(nightX, nightY, nightZ);

      const intensity = Math.max(
        0,
        -Math.sin(angle + Math.PI / 2) * nightIntensity
      );
      nightLightRef.current.intensity = intensity;
    }

    // Dynamic ambient light based on time of day
    if (ambientLightRef.current && dynamicAmbient) {
      const sunHeight = Math.sin(angle + Math.PI / 2);

      if (sunHeight > 0.5) {
        // Day - brighter ambient
        ambientLightRef.current.intensity = ambientIntensity * 2;
      } else if (sunHeight > 0) {
        // Sunrise/Sunset - medium ambient
        ambientLightRef.current.intensity = ambientIntensity * 1.5;
      } else {
        // Night - darker ambient
        ambientLightRef.current.intensity = ambientIntensity * 0.5;
      }
    } else if (ambientLightRef.current) {
      // Static ambient
      ambientLightRef.current.intensity = ambientIntensity;
    }
  });

  return (
    <>
      {/* Day Light (Sun) */}
      <directionalLight
        ref={dayLightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}>
        {/* <Helper
          type={THREE.DirectionalLightHelper}
          args={[dayLightRef.current]}
        /> */}
      </directionalLight>

      {/* Night Light (Moon) */}
      <directionalLight
        ref={nightLightRef}
        color="#5577aa"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Ambient Light */}
      <ambientLight
        ref={ambientLightRef}
        intensity={ambientIntensity}
      />
    </>
  );
}
