import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { BlogPost, Category } from "@shared/schema";

export default function Blog() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const blogCategories = categories?.filter(c => c.type === "blog") || [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold" style={{userSelect: 'none'}}>Blog</h1>
        <p className="text-muted-foreground text-lg" style={{userSelect: 'none'}}>
          Chia sẻ kiến thức, hướng dẫn và góc nhìn về lập trình web
        </p>
      </div>

      {blogCategories.map((category) => (
        <BlogCategory key={category.id} categoryId={category.id} name={category.name} />
      ))}
    </div>
  );
}

function BlogCategory({ categoryId, name }: { categoryId: number; name: string }) {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", { category: categoryId }],
  });

  if (isLoading) {
    return <div>Đang tải bài viết...</div>;
  }

  if (!posts?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent" style={{userSelect: 'none'}}>
        {name}
      </h2>

      <div className="grid gap-6">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <time className="text-sm text-muted-foreground" style={{userSelect: 'none'}}>
                    {format(new Date(post.publishDate), "dd/MM/yyyy")}
                  </time>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" style={{userSelect: 'none'}}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-2xl" style={{userSelect: 'none'}}>{post.title}</CardTitle>
                <CardDescription className="prose prose-sm max-w-none" style={{userSelect: 'none'}}>
                  {post.summary}
                </CardDescription>
                <div className="mt-4" style={{userSelect: 'none'}}>
                  {post.content}
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}