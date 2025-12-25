import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Projects() {
  const projects = [
    {
      title: "FinTech Dashboard",
      desc: "A comprehensive real-time analytics dashboard for banking transactions using React and D3.js. Features include live data streaming, fraud detection alerts, and report generation.",
      tags: ["React", "D3.js", "WebSocket", "Spring Boot"],
      image: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" // Abstract placeholder
    },
    {
      title: "Enterprise Resource Planner",
      desc: "Scalable ERP solution designed for supply chain management. Microservices architecture ensuring high availability and fault tolerance.",
      tags: ["Java", "Microservices", "Kafka", "PostgreSQL"],
      image: "linear-gradient(135deg, #334155 0%, #1e293b 100%)"
    },
    {
      title: "Secure Auth Gateway",
      desc: "Centralized authentication and authorization service implementing OAuth2 and OIDC protocols for enterprise-wide security.",
      tags: ["OAuth2", "Security", "Java", "Redis"],
      image: "linear-gradient(135deg, #475569 0%, #334155 100%)"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Projects</h2>
            <p className="text-muted-foreground">
              A selection of technical projects demonstrating expertise in full-stack development and system architecture.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              View All Github <Github className="ml-2 w-4 h-4"/>
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group">
                <div 
                  className="h-48 w-full transition-transform duration-500 group-hover:scale-105"
                  style={{ background: project.image }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl font-bold">
                    {/* Placeholder visual */}
                    &lt;/&gt;
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {project.title}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Github className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {project.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="font-mono text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
