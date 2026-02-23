import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import AuthInitializer from "@/components/providers/authInitailize";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Jira",
  description: "A minimalist project management application inspired by Jira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthInitializer />
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
          {/* 2. Navbar จะเรียกใช้ useAuthState ได้ทันทีหลังจาก Initializer ทำงาน */}
          <Navbar />

          {children}
          <Toaster richColors position="top-right" />
        </div>
      </body>
    </html>
  );
}
