import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Skills() {
  const skills = {
    "Languages": [
      { name: "Java", level: 95 },
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "SQL", level: 85 },
      { name: "HTML / CSS", level: 85 },
    ],
    "Frameworks": [
      { name: "Spring Boot", level: 95 },
      { name: "React.js", level: 88 },
      { name: "Angular", level: 80 },
      { name: "Node.js", level: 85 },
    ],
    "Tools & Platforms": [
      { name: "AWS", level: 80 },
      { name: "Docker / Kubernetes", level: 85 },
      { name: "Git / CI/CD", level: 90 },
      { name: "Kafka", level: 82 },
    ]
  };

  return (
    <section id="skills" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Technical Proficiency</h2>
          <p className="text-muted-foreground">
            A comprehensive overview of my technical skills and proficiency levels.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {Object.entries(skills).map(([category, items], catIndex) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-6 border-b border-border pb-2">{category}</h3>
              <div className="space-y-6">
                {items.map((skill, index) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
