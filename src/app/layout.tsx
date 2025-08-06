import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบช่วยเหลือการสืบสวนอัจฉริยะ - สถานีตำรวจนิคมพัฒนา",
  description: "ระบบช่วยเหลือการสืบสวนอัจฉริยะสำหรับสถานีตำรวจนิคมพัฒนา ด้วยเทคโนโลยี AI",
  keywords: ["AI", "Investigation", "Police", "Nikhompattana", "สืบสวน", "ตำรวจ", "นิคมพัฒนา"],
  authors: [{ name: "Nikhompattana Police Station" }],
  openGraph: {
    title: "ระบบช่วยเหลือการสืบสวนอัจฉริยะ",
    description: "ระบบช่วยเหลือการสืบสวนอัจฉริยะสำหรับสถานีตำรวจนิคมพัฒนา",
    url: "https://chat.z.ai",
    siteName: "Nikhompattana Police Station",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ระบบช่วยเหลือการสืบสวนอัจฉริยะ",
    description: "ระบบช่วยเหลือการสืบสวนอัจฉริยะสำหรับสถานีตำรวจนิคมพัฒนา",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
