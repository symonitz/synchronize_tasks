import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Sync Dashboard",
  description: "Sync and manage tasks across GitHub and Notion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
