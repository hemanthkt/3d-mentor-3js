"use client";
import Experience from "./components/Experience";
import Navbar from "./components/Navbar";

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
