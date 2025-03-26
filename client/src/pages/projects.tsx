import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Project, Category } from "@shared/schema";

export default function Projects() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const projectCategories = categories?.filter(c => c.type === "project") || [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Dự án</h1>
        <p className="text-muted-foreground text-lg">
          Bộ sưu tập các dự án và sản phẩm gần đây của tôi
        </p>
      </div>

      {projectCategories.map((category) => (
        <ProjectCategory key={category.id} categoryId={category.id} name={category.name} />
      ))}
    </div>
  );
}

function ProjectCategory({ categoryId, name }: { categoryId: number; name: string }) {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", { category: categoryId }],
  });

  if (isLoading) {
    return <div>Đang tải dự án...</div>;
  }

  if (!projects?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" style={{userSelect: 'none'}}>
        {name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle style={{userSelect: 'none'}}>{project.title}</CardTitle>
                <CardDescription style={{userSelect: 'none'}}>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video mb-4">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="rounded-md object-cover w-full h-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" style={{userSelect: 'none'}}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.github && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Mã nguồn
                      </a>
                    </Button>
                  )}
                  {project.link && (
                    <Button size="sm" asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Demo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}