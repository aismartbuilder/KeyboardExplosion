import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keylo - WpDev Keyboard",
  description: "Engineered clarity. Premium keyboard design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
