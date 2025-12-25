import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Server, Layout, Database } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Years Experience", value: "14+" },
    { label: "Projects Completed", value: "50+" },
    { label: "Companies", value: "4" },
  ];

  const services = [
    {
      icon: <Layout className="w-6 h-6 text-primary" />,
      title: "Frontend Architecture",
      desc: "Building responsive, accessible, and performant user interfaces using modern React ecosystems."
    },
    {
      icon: <Server className="w-6 h-6 text-primary" />,
      title: "Backend Development",
      desc: "Designing robust microservices, RESTful APIs, and scalable server-side logic with Java & Node.js."
    },
    {
      icon: <Database className="w-6 h-6 text-primary" />,
      title: "System Design",
      desc: "Architecting high-availability systems with a focus on security, scalability, and maintainability."
    },
    {
      icon: <Code className="w-6 h-6 text-primary" />,
      title: "Technical Leadership",
      desc: "Mentoring teams, code reviews, and driving best practices across the development lifecycle."
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-4">About Me</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I am a seasoned Senior Developer with over a decade of hands-on experience in the software industry. 
            Currently at Bank of America, I specialize in full-stack development, delivering critical financial 
            technology solutions. My passion lies in solving complex problems through clean, efficient code 
            and scalable architecture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
