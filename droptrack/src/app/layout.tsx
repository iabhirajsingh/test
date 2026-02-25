import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropTrack — AI Music Distribution",
  description:
    "Upload once. Distribute to 40+ platforms. AI fills all metadata automatically. No more tedious data entry.",
  openGraph: {
    title: "DropTrack — AI Music Distribution",
    description: "Upload once. AI handles everything.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
