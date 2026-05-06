import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Payments",
  description: "Pay for your event tickets easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased work-sans">{children}</body>
    </html>
  );
}
