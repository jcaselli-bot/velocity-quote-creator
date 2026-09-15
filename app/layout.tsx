import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velocity Roofing PDF Pricer",
  description: "Create completed Velocity Roofing package option PDFs with project and monthly pricing.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
