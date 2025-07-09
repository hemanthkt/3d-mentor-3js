"use client";

import React from "react";
import { signIn } from "next-auth/react";
import SignInBtn from "./SignInBtn";

export default function Navbar() {
  return (
    <div className="z-10 flex space-y-6 flex-col bg-gradient-to-tr justify-items-end  from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4  backdrop-blur-md rounded-xl border-slate-100/30 border">
      <div className="flex justify-between pr-2 items-center">
        <div>
          <img
            src="https://www.impactoverse.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcolored_white.279e09d9.png&amp;w=256&amp;q=75"
            alt=""
          />
        </div>

        <SignInBtn />
      </div>
    </div>
  );
}
