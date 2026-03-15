import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MissedCall.ai - Never Lose a Customer to Voicemail Again",
  description:
    "AI-powered phone receptionist for small businesses. Answer every call, book appointments, and send instant summaries — even when you can't pick up.",
  keywords: [
    "AI receptionist",
    "missed call",
    "small business",
    "phone answering",
    "virtual receptionist",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
