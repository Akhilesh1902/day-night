/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Environment,
  OrbitControls,
  Plane,
  SoftShadows,
  Text,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import DayNightLights from "./DayNightLights";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import { useControls } from "leva";
import { PostProcessing } from "./PostProcessing";

function Model({
  setLoadingModel,
}: {
  setLoadingModel: (loading: boolean) => void;
}) {
  const { scene } = useGLTF(
    "model/finedine.glb",
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
        if (child.name.includes("Window")) {
          child.castShadow = false;
          child.receiveShadow = false;
          return;
        }
        child.castShadow = true;
        child.receiveShadow = true;
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
        position={[0, 0.09, 0]}
      />
    </>
  );
}

const ThreeJSWrapper = () => {
  const [loadingModel, setLoadingModel] = useState(true);
  const { enabled, ...config } = useControls({
    enabled: true,
    size: { value: 25, min: 0, max: 100 },
    focus: { value: 0, min: 0, max: 2 },
    samples: { value: 10, min: 1, max: 20, step: 1 },
  });
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  return (
    <>
      {loadingModel && (
        <Text
          position={[0, 0, -2]} // center of your scene, adjust as needed
          fontSize={1} // size of text
          color="white" // text color
          anchorX="center" // horizontally center text alignment
          anchorY="middle" // vertically center text alignment
        >
          Loading Model...
        </Text>
      )}

      {enabled && <SoftShadows {...config} />}
      <Suspense fallback={null}>
        <Model setLoadingModel={setLoadingModel} />
        <Plane
          args={[100, 100]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow={true}>
          <meshStandardMaterial color="#ffedbf" />
        </Plane>
        <OrbitControls
        // minDistance={2}
        // maxDistance={5}
        />

        <DayNightLights />
      </Suspense>
      {/* <Environment preset="city" /> */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={300}
          mipmapBlur={false}
          // intensity={1.0}
        />
        <N8AO
          aoSamples={32}
          aoRadius={0.5}
          intensity={1}
        />
      </EffectComposer>
      {/* <PostProcessing
        scene={scene}
        camera={camera}
      /> */}
    </>
  );
};

export default ThreeJSWrapper;
