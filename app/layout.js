export const metadata = {
  title: 'ARC — Vêtements & chaussures',
  description: "Boutique en ligne ARC : vêtements et chaussures sélectionnés avec soin.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
