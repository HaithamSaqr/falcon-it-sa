import "@/app/globals.css";

export const metadata = {
  title: "Quick Setup — Falcon",
  robots: { index: false, follow: false },
};

export default function SetupRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
