import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Experience() {
  const experiences = [
    {
      company: "Bank of America",
      role: "Senior Developer",
      period: "2018 - Present",
      location: "India",
      desc: "Leading development of core banking applications. Improved transaction processing speed by 40% through microservices migration. Mentoring a team of 8 junior developers.",
      tech: ["Java", "Spring Boot", "React", "Oracle", "Microservices"]
    },
    {
      company: "Tech Mahindra",
      role: "Technical Lead",
      period: "2014 - 2018",
      location: "Pune, India",
      desc: "Architected and delivered large-scale enterprise solutions for telecom clients. Managed client requirements and technical delivery timelines.",
      tech: ["Java EE", "Angular", "SQL Server", "WebLogic"]
    },
    {
      company: "Infosys",
      role: "Software Engineer",
      period: "2010 - 2014",
      location: "Bangalore, India",
      desc: "Developed and maintained legacy systems. Collaborated with cross-functional teams to implement new features and bug fixes.",
      tech: ["Java", "JSP", "Servlets", "MySQL"]
    }
  ];

  return (
    <section id="experience" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Work Experience</h2>
          <p className="text-muted-foreground">
            A timeline of my professional journey in software engineering.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-border transform md:-translate-x-1/2 ml-6 md:ml-0" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background transform -translate-x-1/2 mt-1.5 z-10" />

                {/* Content */}
                <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                  <div className="bg-card border border-border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{exp.role}</h3>
                        <div className="text-primary font-medium">{exp.company}</div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {exp.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <Badge key={t} variant="secondary" className="font-normal text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
