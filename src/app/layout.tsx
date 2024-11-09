import type { Metadata } from "next";
import { NavigationHeader } from "./_components/navigationHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vectorアーカイブ",
  description: "2004/12に閉鎖したVectorの個人サイトをアーカイブします",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={``} >
        <NavigationHeader></NavigationHeader>
        {children}
        <div>
          全てのデータは<a href="https://www.vector.co.jp/" target="_blank" className="original-href">vector</a>より。
          Github:<a href="https://github.com/fushihara/xxxx" target="_blank" className="original-href">archive</a> , <a href="https://github.com/fushihara/xxxx" target="_blank" className="original-href">crawler</a>
        </div>
      </body>
    </html>
  );
}
