import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Realtime Chat Client",
  description: "Testing realtime messaging backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}