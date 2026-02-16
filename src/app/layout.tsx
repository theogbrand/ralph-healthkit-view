import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ralph - Apple Health Dashboard",
  description: "Local-first fitness dashboard for Apple Health data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
