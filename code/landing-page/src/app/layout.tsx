import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALVICARE One — Autonomous Home-Care & Caregiver Companion",
  description:
    "The world's most advanced autonomous home-care companion. Brushed white aluminium indoor unit, 5-cylinder pill carousel, 2D LiDAR SLAM, and real-time smartwatch caregiver telemetry.",
  keywords: [
    "ALVICARE",
    "ALVI",
    "ALVI One",
    "Autonomous Robotics",
    "Home Care",
    "Companion Robot",
    "Medication Dispenser",
    "Fall Detection",
    "LiDAR SLAM",
    "Smartwatch Telemetry",
  ],
  authors: [{ name: "ALVICARE Systems" }],
  openGraph: {
    title: "ALVICARE One — Autonomous Home-Care & Caregiver Companion",
    description:
      "One system, two parts. An indoor companion robot that blends into the home, paired with a smartwatch and caregiver link.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-primary selection:bg-slateMist selection:text-slateAccent antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
