import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dommus Smart Home',
  description: 'Transforme sua casa em um lar inteligente com automações avançadas e tecnologia de ponta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
