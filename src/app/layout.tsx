import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { DataProvider } from "./context/dataContext";
import HotjarAnalytics from "@/components/Hotjar"
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialProjects = await getAllProjects();
  if (initialProjects instanceof Error) {
    throw initialProjects
  }
  return (
    <html lang="en">
      <body className="antialiased">
        <AntdRegistry>
          <nav>
            <NavBar />
          </nav>
          <DataProvider initialProjects={initialProjects}>
            {children}
          </DataProvider>
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID || ""} />
          <Analytics />
          <HotjarAnalytics />
        </AntdRegistry>
      </body>
    </html>
  );
}
