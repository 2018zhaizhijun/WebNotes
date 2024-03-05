import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./authorHomePage.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebNotes",
  description: "Author homepage for WebNotes application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}