"use client";

import PDF from "common/components/PDF";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <PDF />
    </SessionProvider>
  );
}
