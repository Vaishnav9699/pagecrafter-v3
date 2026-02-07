'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

function BodyContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <body
      className={` ${inter.className} antialiased`}
      data-theme={theme}
    >
      {children}
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <AuthProvider>
          <BodyContent>
            {children}
          </BodyContent>
        </AuthProvider>
      </ThemeProvider>
    </html>
  );
}
