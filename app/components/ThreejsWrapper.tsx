/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { OrbitControls, Plane, SoftShadows, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import DayNightLights from "./DayNightLights";

function Model({
  setLoadingModel,
}: {
  setLoadingModel: (loading: boolean) => void;
}) {
  const lightRef = useRef(null);
  const { scene } = useGLTF(
    "model/nor.glb",
    true,
    undefined,
    // @ts-expect-error : Ignore progress type issue
    (progress: { loaded: number; total: number }) => {
      console.log(
        "Loading:",
        ((progress.loaded / progress.total) * 100).toFixed(0) + "%"
      );
    }
  );

  useEffect(() => {
    // Enable shadows on all meshes when model loads
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        // child.receiveShadow = true;
      }
    });

    console.log("✓ Shadows enabled on model");
    setLoadingModel(false);
  }, [scene, setLoadingModel]);

  // Set loading complete
  useState(() => {
    setLoadingModel(false);
  });

  return (
    <>
      <primitive
        object={scene}
        scale={0.2}
        rotation-y={-Math.PI / 2}
      />
      <pointLight
        ref={lightRef}
        position={[-0.4, 0.5, 0]}
        intensity={1}
        castShadow
        color={"#ffedbf"}>
        {/* <Helper
          type={PointLightHelper}
          args={[0.2, "red"]}
        /> */}
      </pointLight>
    </>
  );
}

const ThreeJSWrapper = () => {
  const [loadingModel, setLoadingModel] = useState(true);
  return (
    <>
      {loadingModel && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "24px",
            zIndex: 10,
          }}>
          Loading Model...
        </div>
      )}

      <Canvas
        shadows={true}
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
        <Suspense fallback={null}>
          <Model setLoadingModel={setLoadingModel} />
          <Plane
            args={[100, 100]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow={true}>
            <meshStandardMaterial color="#ffedbf" />
          </Plane>
          <OrbitControls
            minDistance={2}
            maxDistance={5}
          />

          <DayNightLights />
          <SoftShadows />
        </Suspense>
      </Canvas>
    </>
  );
};

export default ThreeJSWrapper;
