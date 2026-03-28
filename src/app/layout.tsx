import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Falcon Smart Solutions | Enterprise ERP for MENA",
  description:
    "MENA-native ERP platform with ZATCA compliance, Arabic support, and on-premise data sovereignty.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
