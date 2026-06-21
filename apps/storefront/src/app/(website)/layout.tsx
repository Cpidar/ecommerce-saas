import type { Metadata } from "next";
// import { Analytics } from '@vercel/analytics/react'
// import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: "Nitro | SAAS Launcher",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-marketing">
      {children}
      {/* <Analytics />
        <SpeedInsights /> */}
    </div>
  );
}
