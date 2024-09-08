import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Noto_Sans as NotoSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

const notoSans = NotoSans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oktatas AI Procedural Curriculum",
  description: "Procedural curriculum for AI education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(notoSans.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors duration={5000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
