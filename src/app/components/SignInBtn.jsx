"use client";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import React from "react";
export default function SignInBtn() {
  const { status, data: session } = useSession();
  return (
    <div>
      <div className="flex gap-2">
        {status === "authenticated" ? (
          <Image
            src={session?.user.image}
            width={35}
            height={35}
            alt=""
            className="rounded-full"
          />
        ) : null}

        {status === "authenticated" ? (
          <button
            onClick={() => signOut()}
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white cursor-pointer"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
