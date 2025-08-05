"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().min(1, "Slug is required").max(200, "Slug too long"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  publishedAt: z.date().optional(),
  seoTitle: z.string().max(60, "SEO title too long").optional(),
  seoDescription: z.string().max(160, "SEO description too long").optional(),
  categoryIds: z.array(z.number()),
  tagIds: z.array(z.number()),
});

type CreatePostData = z.infer<typeof createPostSchema>;

/**
 * NewBlogPost component for creating a new blog post.
 *
 * This component manages the state of a new blog post, including form data, categories,
 * tags, and errors. It fetches available categories and tags using queries and provides
 * functionality to create new categories and tags. The component also handles generating
 * slugs from titles, toggling category and tag selections, and submitting the post for
 * either draft or published status.
 *
 * @returns A React component rendering a form for creating a new blog post.
 */
export default function NewBlogPost() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePostData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    status: "draft",
    seoTitle: "",
  seoDescription: "",
    categoryIds: [],
    tagIds: [],
  });
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries
  const { data: categories = [] } = api.blog.getCategories.useQuery();
  const { data: tags = [] } = api.blog.getTags.useQuery();

  // Mutations
  const createPost = api.blog.createPost.useMutation({
    onSuccess: (data) => {
      toast.success("Post created successfully");
      router.push(`/dashboard/blog/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createCategory = api.blog.createCategory.useMutation({
    onSuccess: () => {
      setNewCategory("");
      toast.success("Category created");
    },
  });

  const createTag = api.blog.createTag.useMutation({
    onSuccess: () => {
      setNewTag("");
      toast.success("Tag created");
    },
  });

  /**
   * Generates a slug from a given title by converting it to lowercase, removing non-alphanumeric characters except spaces and hyphens, replacing multiple spaces or hyphens with a single hyphen, and trimming the result.
   */
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  /**
   * Updates form data with a new title and optionally generates a new slug.
   */
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  /**
   * Handles form submission by validating and submitting post data.
   *
   * It prepares the data to be submitted based on the status, validates it using createPostSchema,
   * and then attempts to mutate the data asynchronously. If validation fails, it catches the ZodError,
   * extracts the field errors, and sets them in the state while displaying an error toast.
   *
   * @param status - The publication status of the post, either "draft" or "published".
   */
  const handleSubmit = async (status: "draft" | "published") => {
    try {
      const dataToSubmit = {
        ...formData,
        status,
        publishedAt: status === "published" ? new Date() : undefined,
        featuredImage: formData.featuredImage ?? undefined,
        excerpt: formData.excerpt ?? undefined,
        seoTitle: formData.seoTitle ?? undefined,
    seoDescription: formData.seoDescription ?? undefined,
      };

      const validatedData = createPostSchema.parse(dataToSubmit);
      await createPost.mutateAsync(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the form errors");
      }
    }
  };

  /**
   * Handles creating a new category by validating input and mutating state.
   */
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory.mutateAsync({
      name: newCategory.trim(),
      slug: generateSlug(newCategory.trim())
    });
  };

  /**
   * Creates a new tag if the input is not empty.
   */
  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    await createTag.mutateAsync({
      name: newTag.trim(),
      slug: generateSlug(newTag.trim())
    });
  };

  /**
   * Toggles the inclusion of a category ID in the form data.
   */
  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  /**
   * Toggles a tag by its ID in the form data.
   */
  const toggleTag = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
            <p className="text-muted-foreground">Write and publish a new blog post.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={createPost.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit("published")}
            disabled={createPost.isPending}
          >
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-slug" className="text-sm">Auto-generate</Label>
                    <Switch
                      id="auto-slug"
                      checked={autoSlug}
                      onCheckedChange={setAutoSlug}
                    />
                  </div>
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                  disabled={autoSlug}
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                <p className="text-sm text-muted-foreground">
                  URL: /blog/{formData.slug || "post-url-slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post..."
                  rows={3}
                  className={errors.excerpt ? "border-red-500" : ""}
                />
                {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
                <p className="text-sm text-muted-foreground">
                  {formData.excerpt?.length ?? 0}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog post content here..."
                  rows={15}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className={errors.featuredImage ? "border-red-500" : ""}
                />
                {errors.featuredImage && <p className="text-sm text-red-500">{errors.featuredImage}</p>}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO-optimized title"
                  className={errors.seoTitle ? "border-red-500" : ""}
                />
                {errors.seoTitle && <p className="text-sm text-red-500">{errors.seoTitle}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.seoTitle?.length ?? 0}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Brief description for search engines"
                  rows={3}
                  className={errors.seoDescription ? "border-red-500" : ""}
                />
                {errors.seoDescription && <p className="text-sm text-red-500">{errors.seoDescription}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.seoDescription?.length ?? 0}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category..."
                  onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
                />
                <Button
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={!newCategory.trim() || createCategory.isPending}
                >
                  Add
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`category-${category.id}`} className="flex-1">
                      {category.name}
                    </Label>

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
                />
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTag.trim() || createTag.isPending}
                >
                  Add
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={formData.tagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="flex-1">
                      {tag.name}
                    </Label>

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}