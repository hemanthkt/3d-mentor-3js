"use client";
import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Box,
  CameraControls,
  Environment,
  Gltf,
  Html,
  OrbitControls,
} from "@react-three/drei";
import { Teacher } from "./Teacher";
import { degToRad } from "three/src/math/MathUtils";
import { TypingBox } from "./TypingBox";
import { MessagesList } from "./MessagesList";
import { BoardSetting } from "./BoardSetting";
import { button, useControls } from "leva";
import { useAITeacher } from "../hooks/useAITeacher";

function Experience() {
  const teacher = useAITeacher((state) => state.teacher);
  return (
    <div className="h-screen w-full">
      <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch">
        <TypingBox />
      </div>
      <Canvas camera={{ position: [0, 0, 0.0001] }}>
        <CameraManager />

        <Environment preset="sunset" />
        <ambientLight intensity={0.8} color="pink" />
        <Html position={[0.22, 0.192, -3]} transform distanceFactor={0.5}>
          <MessagesList />
          <BoardSetting />
        </Html>
        <Teacher
          key={teacher}
          teacher={teacher}
          position={[-1, -1.7, -3]}
          scale={1.5}
          rotation-y={degToRad(20)}
        />
        <Gltf src="/models/classroom_default.glb" position={[0.2, -1.7, -1]} />
      </Canvas>
    </div>
  );
}

const CAMERA_POSITIONS = {
  default: [0, 6.123233995736766e-21, 0.0001],
  loading: [
    0.00002621880610890309, 0.00000515037441056466, 0.00009636414192870058,
  ],
  speaking: [0, -1.6481333940859815e-7, 0.00009999846226827279],
};

const CAMERA_ZOOMS = {
  default: 1,
  loading: 1.3,
  speaking: 2.1204819420055387,
};

const CameraManager = () => {
  const controls = useRef();
  const loading = useAITeacher((state) => state.loading);
  const currentMessage = useAITeacher((state) => state.currentMessage);
  useEffect(() => {
    if (loading) {
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true);
    } else if (currentMessage) {
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true);
    }
  }, [loading]);

  useControls("Helper", {
    getCameraPosition: button(() => {
      const position = controls.current.getPosition();
      const zoom = controls.current.camera.zoom;
      console.log(...position, zoom);
    }),
  });

  const handleZoom = (zoomIn = true) => {
    if (cameraRef.current) {
      if (zoomIn) {
        cameraRef.current.zoomTo(1, true); // Zoom towards the board
      } else {
        cameraRef.current.zoomTo(3, true); // Zoom back to initial position
      }
    }
  };

  return (
    <>
      <CameraControls
        ref={controls}
        minZoom={1}
        maxZoom={3} // Minimum zoom-in (closer to the board)
        // maxDistance={3} // Maximum zoom-out (initial position)
        polarRotateSpeed={-0.3}
        azimuthRotateSpeed={-0.3}
        mouseButtons={{
          left: 1,
          wheel: 16,
        }}
        touches={{
          one: 32,
          two: 512,
        }}
      />
    </>
  );
};

export default Experience;
