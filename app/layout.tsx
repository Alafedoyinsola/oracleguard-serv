import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OracleGuard | Prediction Market Resolution & Edge Auditor",
  description:
    "AI-powered Prediction Market Resolution & Edge Auditor powered by OpenServ SERV Reasoning API. Audits oracle dispute risks and quantitative edge.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e17] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
