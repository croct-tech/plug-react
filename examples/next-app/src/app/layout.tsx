"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { CroctProvider } from "@croct/plug-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CroctProvider appId={process.env.NEXT_PUBLIC_CROCT_APP_ID as string}>
        <body className={inter.className}>{children}</body>
      </CroctProvider>
    </html>
  );
}
