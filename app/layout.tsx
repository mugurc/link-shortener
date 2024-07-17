import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "./Components/Layout";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "URL Shortener and Click Tracking Application",
  description:
    "An intuitive web application for creating short URLs, tracking clicks, and redirecting users. Manage your links effortlessly with custom short URLs and real-time analytics. Perfect for marketers, developers, and business owners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>
          {children}
          <Toaster />
        </Layout>
      </body>
    </html>
  );
}
