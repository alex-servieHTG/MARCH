import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider } from "@/components/theme-provider"

import { DataProvider } from "./context/dataContext";
import { getAllProjects } from "@/utils/dashboard";

export const metadata: Metadata = {
  title: "MARCH",
  description: "MARCH materials coming soon",
  openGraph: {
    title: "MARCH",
    description: "MARCH materials beta application",
    type: "website",
    locale: "en",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialProjectsFetch = getAllProjects();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AntdRegistry>
            <nav>
              <NavBar />
            </nav>
            <DataProvider initialProjectsFetch={initialProjectsFetch}>
            {children}
            </DataProvider>
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID || ""} />
            <Analytics />
          </AntdRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
