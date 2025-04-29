"use client";
import Image from "next/image";
import Experience from "./components/Experience";
import Navbar from "./components/Navbar";
import { NextAuthProvider } from "./Providers";
import TestContentPost from "./components/TestComponent";

export default function Home() {
  return (
    <main>
      <TestContentPost />
      <div className="absolute z-10 w-full">
        <Navbar />
      </div>
      <div className="relative">
        <Experience />
      </div>
    </main>
  );
}
