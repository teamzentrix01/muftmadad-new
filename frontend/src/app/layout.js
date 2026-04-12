import "./globals.css";
import { CityProvider } from '@/context/cityContext';
import { LanguageProvider } from '@/context/languageContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          <CityProvider>
            {children}
          </CityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
