import type { Metadata } from "next";
import "./globals.css";
import { BYOKProvider } from "@/context/BYOKContext";

export const metadata: Metadata = {
  title: "Content Engine · Turn 1 Voice Call Into a Week of Content",
  description: "Autonomous BYOK AI Voice Interviewer & 6-Channel Platform-Native Content Studio",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <BYOKProvider>{children}</BYOKProvider>
      </body>
    </html>
  );
}
