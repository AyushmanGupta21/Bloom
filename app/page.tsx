import { JetBrains_Mono } from "next/font/google";
import VertexNavbar from "./_components/VertexNavbar";
import VertexHero from "./_components/VertexHero";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

export default function Home() {
  return (
    <main className={`${jetbrainsMono.className} min-h-screen w-full bg-black text-white font-mono antialiased overflow-x-hidden`}>
      <VertexNavbar />
      <VertexHero />
    </main>
  );
}
