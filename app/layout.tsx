import type { Metadata } from "next";
import Cursor from "@/components/ui/Cursor";
import MotionProvider from "@/components/ui/MotionProvider";
import "./globals.css";
import "./v2.css";

export const metadata: Metadata = {
  title: "Mandakini Rao",
  description: "Artist website for Mandakini Rao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* runs before paint: returning visitors never see the loader
            flash — CSS hides it via the html class */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('mr2-intro-seen'))document.documentElement.classList.add('mr-intro-seen')}catch(e){}",
          }}
        />
        <MotionProvider />
        {/* single mount; the component portals itself to document.body */}
        <Cursor />
        {children}
      </body>
    </html>
  );
}
