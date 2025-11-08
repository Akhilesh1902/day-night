/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

extend({ EffectComposer, RenderPass, ShaderPass });

const SSRShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    projectionMatrix: { value: new THREE.Matrix4() },
    projectionMatrixInverse: { value: new THREE.Matrix4() },
    resolution: { value: new THREE.Vector2() },
    maxDistance: { value: 10 },
    maxSteps: { value: 20 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;

    void main(){
      // Simple pass through for demo
      gl_FragColor = texture2D(tDiffuse, vUv);
    }
  `,
};

export function PostProcessing({ scene, camera }: { scene: any; camera: any }) {
  const composer = useRef(null);
  const { gl, size } = useThree();
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SSRShader.vertexShader,
        fragmentShader: SSRShader.fragmentShader,
        uniforms: THREE.UniformsUtils.clone(SSRShader.uniforms),
      }),
    []
  );

  useEffect(() => {
    // @ts-expect-error : Ignore type issue
    if (composer.current) composer.current.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    if (!composer.current) return;

    // Update projection inverse matrix explicitly
    const projInverse = new THREE.Matrix4()
      .copy(camera.projectionMatrix)
      .invert();

    shaderMaterial.uniforms.projectionMatrix.value.copy(
      camera.projectionMatrix
    );
    shaderMaterial.uniforms.projectionMatrixInverse.value.copy(projInverse);
    shaderMaterial.uniforms.resolution.value.set(size.width, size.height);
    // eslint-disable-next-line react-hooks/immutability
    shaderMaterial.uniforms.tDiffuse.value =
      // @ts-expect-error : Ignore type issue
      composer.current.readBuffer.texture; // or from your color buffer
    // @ts-expect-error : Ignore type issue
    composer.current.render();
  }, 1);

  return (
    <effectComposer
      ref={composer}
      args={[gl]}>
      <renderPass
        // @ts-expect-error : Ignore type issue
        attachArray="passes"
        scene={scene}
        camera={camera}
      />
      <shaderPass
        // @ts-expect-error : Ignore type issue
        attachArray="passes"
        args={[shaderMaterial]}
      />
      {/* Add additional passes like Bloom or AO after with care */}
    </effectComposer>
  );
}
