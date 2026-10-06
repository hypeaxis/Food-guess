import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "@/store/StoreProvider";
import { ConnectionBanner } from "@/components/room";
import { ToastContainer } from "@/components/shared";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Guess — Đoán Món Ăn",
  description: "Game đoán tên món ăn qua hình ảnh cùng bạn bè, theo thời gian thực.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <ConnectionBanner />
          {children}
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
