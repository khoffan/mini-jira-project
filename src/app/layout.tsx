import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { antdTheme } from "@/lib/antd-config";
import AuthInitializer from "@/components/providers/authInitailize";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <ThemeProvider>
              <AuthInitializer />
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
