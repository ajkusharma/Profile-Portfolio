import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@assets/generated_images/professional_developer_abstract_background_with_code_elements.png";
import avatar from "@assets/generated_images/professional_developer_avatar_placeholder.png";

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/90 z-10" />
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-mono font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              Senior Full Stack Developer
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Hi, I'm <span className="text-primary">Ajay Sharma</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Architecting scalable enterprise solutions with over 14 years of experience. Currently driving technical innovation at <span className="text-foreground font-semibold">Bank of America</span>.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <Button size="lg" className="group" asChild>
                <a href="#projects">
                  View Projects
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="https://www.ajkusharma.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit ajkusharma.com
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>

            <div className="flex gap-6">
              <a href="https://github.com" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/ajay-sharma-developer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ajay Sharma on LinkedIn"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:contact@ajay.dev" aria-label="Email Ajay Sharma" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center md:justify-end"
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Decorative rings */}
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 border-2 border-primary/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-background shadow-2xl">
                <img 
                  src={avatar} 
                  alt="Ajay Sharma" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-card border border-border p-4 rounded-xl shadow-lg flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-sm font-semibold">Open to Opportunities</span>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
