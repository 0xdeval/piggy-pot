import type { Metadata } from "next";
import { startWebSocketServer } from "@/libs/socket/init";

export const metadata: Metadata = {
  title: "Piggy Pot API",
  description: "DeFi liquidity management API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  startWebSocketServer(8086);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
