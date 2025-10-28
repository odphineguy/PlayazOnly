import { HeroHeader } from "./header";
import CallToAction from "./call-to-action";
import Footer from "./footer";

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <main className="min-h-[60vh] flex items-center justify-center">
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
