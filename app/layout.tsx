import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "DALALA Motors & Machinery",
    template: "%s | DALALA",
  },
  description:
    "Buy and sell cars, trucks, excavators, bulldozers, tractors and heavy machinery across Ethiopia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
