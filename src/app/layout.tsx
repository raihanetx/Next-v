import type { Metadata } from "next";
import { Inter, League_Spartan } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Submonth - Premium Digital Subscriptions",
  description: "Submonth is your trusted source for premium digital subscriptions and courses in Bangladesh. Get affordable access to tools like Canva Pro, ChatGPT Plus, and more.",
  keywords: ["digital subscriptions", "premium accounts", "online courses", "submonth", "bangladesh", "canva pro", "chatgpt plus", "affordable price"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="https://i.postimg.cc/ncGxB1jm/IMG-20250919-WA0036.jpg" />
        <link rel="apple-touch-icon" href="https://i.postimg.cc/ncGxB1jm/IMG-20250919-WA0036.jpg" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body
        className={`${inter.variable} ${leagueSpartan.variable} antialiased bg-gray-50 text-gray-800`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
