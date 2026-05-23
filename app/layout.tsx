import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RefZone - Official Rulebook Assistant",
  description:
    "Learn the rules and ask questions directly to our AI rulebook engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-900 flex flex-col min-h-screen antialiased`}
      >
        {/* Universal Top Navbar */}
        <Navbar />

        {/* Main page content stretches to fill empty vertical space */}
        <main className="flex-1">{children}</main>

        {/* Universal Bottom Footer */}
        <Footer />
      </body>
    </html>
  );
}
