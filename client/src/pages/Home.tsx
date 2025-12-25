import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="py-6 border-t border-border bg-background text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Ajay Sharma. All rights reserved.</p>
      </footer>
    </div>
  );
}
