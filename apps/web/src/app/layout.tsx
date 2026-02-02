export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Project AUTO</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
