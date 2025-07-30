import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Piggy Pot API",
  description: "DeFi liquidity management API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
