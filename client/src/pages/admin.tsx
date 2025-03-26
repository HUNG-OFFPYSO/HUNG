import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { insertProjectSchema, insertBlogPostSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InsertProject, InsertBlogPost, Category } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const projectForm = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      image: "",
      tags: [],
      link: "",
      github: "",
    },
  });

  const blogForm = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      publishDate: new Date().toISOString().split('T')[0],
      tags: [],
    },
  });

  const projectMutation = useMutation({
    mutationFn: (data: InsertProject) =>
      apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm dự án mới",
      });
      projectForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm dự án. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const blogMutation = useMutation({
    mutationFn: (data: InsertBlogPost) =>
      apiRequest("POST", "/api/blog", data),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm bài viết mới",
      });
      blogForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm bài viết. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">Quản lý nội dung</h1>
      </motion.div>

      <Tabs defaultValue="project">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="project">Dự án</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle>Thêm dự án mới</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...projectForm}>
                <form
                  onSubmit={projectForm.handleSubmit((data) => {
                    const tags = data.tags as unknown as string;
                    projectMutation.mutate({
                      ...data,
                      tags: tags.split(",").map(t => t.trim()),
                    });
                  })}
                  className="space-y-6"
                >
                  <FormField
                    control={projectForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả ngắn</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội dung</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link ảnh</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (phân cách bằng dấu phẩy)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link demo (không bắt buộc)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link GitHub (không bắt buộc)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            {...field}
                          >
                            <option value="">Chọn danh mục</option>
                            {categories?.filter(c => c.type === "project").map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={projectMutation.isPending}
                  >
                    {projectMutation.isPending ? "Đang thêm..." : "Thêm dự án"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Thêm bài viết mới</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...blogForm}>
                <form
                  onSubmit={blogForm.handleSubmit((data) => {
                    const tags = data.tags as unknown as string;
                    blogMutation.mutate({
                      ...data,
                      tags: tags.split(",").map(t => t.trim()),
                    });
                  })}
                  className="space-y-6"
                >
                  <FormField
                    control={blogForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tóm tắt</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội dung</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="publishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày đăng</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (phân cách bằng dấu phẩy)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            {...field}
                          >
                            <option value="">Chọn danh mục</option>
                            {categories?.filter(c => c.type === "blog").map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={blogMutation.isPending}
                  >
                    {blogMutation.isPending ? "Đang thêm..." : "Thêm bài viết"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
