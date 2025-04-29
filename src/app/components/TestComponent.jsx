"use client";

import { useSession } from "next-auth/react";

export default function TestContentPost() {
  const { data: session } = useSession();

  const handlePost = async () => {
    console.log("Current session on client:", session); // Client-side session
    const res = await fetch("/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "What is AI?",
        answer: "Artificial Intelligence",
      }),
    });

    const data = await res.json();
    console.log("API response:", data);
  };

  return (
    <div>
      <button className="cursor-pointer" onClick={handlePost}>
        Test Post
      </button>
    </div>
  );
}
