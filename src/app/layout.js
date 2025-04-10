import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
