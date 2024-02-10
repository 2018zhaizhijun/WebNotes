"use client";

import TestComp from "common/components/TestComp";
import PDF from "common/components/PDF";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      {/* <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
         <TestComp />
        </div>
       </main> */}
      <PDF />
    </SessionProvider>
  );
}
