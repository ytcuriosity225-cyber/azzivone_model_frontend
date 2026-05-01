import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Azzivone | Clinical Luxury Skincare",
  description: "Experience AI-powered personalized clinical luxury skincare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} text-gray-900`} suppressHydrationWarning>
        <div className="min-h-screen flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
