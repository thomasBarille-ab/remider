import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Planner",
  description: "Intelligent daily planner and reminder app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased text-gray-900 bg-gray-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}