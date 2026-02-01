import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Hiring – AI-Powered Skill Verification',
  description: 'Leetcode + Resume Screening + AI Interview + Skill Verification',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#0a0a0f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
