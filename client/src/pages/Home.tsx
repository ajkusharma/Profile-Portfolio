import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import ThoughtLeadership from "@/components/ThoughtLeadership";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

export default function Home() {
  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ block: "start" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <ThoughtLeadership />
        <Skills />
        <Contact />
      </main>
      <footer className="py-6 border-t border-border bg-background text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Ajay Sharma. All rights reserved.{" "}
          <a
            href="https://www.ajkusharma.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-primary underline-offset-4 hover:underline"
          >
            www.ajkusharma.com
          </a>
        </p>
      </footer>
    </div>
  );
}
