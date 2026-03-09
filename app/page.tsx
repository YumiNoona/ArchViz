import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import BackgroundCanvas from "@/components/BackgroundCanvas";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <BackgroundCanvas />
      <div className="relative z-[1]">
        <Navbar />
        <Hero />
        <ProjectGrid />
        <About />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}
