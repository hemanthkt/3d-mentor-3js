"use client";
import Image from "next/image";
import Experience from "./components/Experience";
import Navbar from "./components/Navbar";
import { NextAuthProvider } from "./Providers";
import TestContentPost from "./components/TestComponent";
import ContentModal from "./pages/ContentModal";

export default function Home() {
  return (
    <main>
      <div className="absolute z-10 w-full">
        <Navbar />
      </div>
      <div className="relative">
        <Experience />
      </div>
    </main>
  );
}
