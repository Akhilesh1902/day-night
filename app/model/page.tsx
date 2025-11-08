"use client";
import { Canvas } from "@react-three/fiber";
import ThreeJSWrapper from "../components/ThreejsWrapper";

export default function page() {
  return (
    <div>
      <Canvas
        shadows={true}
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
        <ThreeJSWrapper />
      </Canvas>
    </div>
  );
}
