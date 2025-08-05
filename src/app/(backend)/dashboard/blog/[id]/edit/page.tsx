"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";

const updatePostSchema = z.object({
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

type UpdatePostData = z.infer<typeof updatePostSchema>;

interface EditBlogPostProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * React component for editing a blog post.
 *
 * This component is responsible for rendering a form to edit a blog post's details,
 * including its title, slug, content, SEO settings, categories, and tags.
 * It also provides functionality to create new categories and tags.
 *
 * @param {Object} props - The component props.
 * @param {Promise<{ id: string }>} props.params.id - The ID of the blog post to be edited.
 * @returns {JSX.Element} The JSX element representing the edit blog post form.
 */
export default function EditBlogPost({ params }: EditBlogPostProps) {
  const router = useRouter();
  const [postId, setPostId] = useState<number | null>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then(({ id }) => {
      setPostId(parseInt(id));
    });
  }, [params]);
  const [formData, setFormData] = useState<UpdatePostData | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries
  const { data: post, isLoading: postLoading } = api.blog.getPost.useQuery(
    { id: postId! },
    { enabled: postId !== null }
  );
  const { data: categories = [] } = api.blog.getCategories.useQuery();
  const { data: tags = [] } = api.blog.getTags.useQuery();

  // Mutations
  const updatePost = api.blog.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePost = api.blog.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      router.push("/dashboard/blog");
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

  // Initialize form data when post loads
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content,
        featuredImage: post.featuredImage ?? "",
        status: post.status as "draft" | "published" | "archived",
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        categoryIds: post.categories.map(pc => pc.category.id as number),
        tagIds: post.tags.map(pt => pt.tag.id as number),
      });
    }
  }, [post]);

  /**
   * Generates a URL-friendly slug from a given title.
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
   * Handles changes to the form title and updates the form data accordingly.
   *
   * This function updates the form data with the new title. If `autoSlug` is true,
   * it generates a slug based on the new title; otherwise, it retains the previous slug.
   * If `formData` is not available, the function does nothing.
   */
  const handleTitleChange = (title: string) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    } : null);
  };

  /**
   * Handles the submission of post data.
   *
   * This function processes and validates the form data, updating the post status if necessary,
   * and handles any validation errors by setting field-specific error messages and displaying a toast notification.
   *
   * @param status - An optional string representing the new status of the post ("draft", "published", or "archived").
   */
  const handleSubmit = async (status?: "draft" | "published" | "archived") => {
    if (!formData || postId === null) return;

    try {
      const dataToSubmit = {
        ...formData,
        status: status ?? formData.status,
        publishedAt: (status === "published" && !formData.publishedAt) ? new Date() : formData.publishedAt,
        featuredImage: formData.featuredImage ?? undefined,
        excerpt: formData.excerpt ?? undefined,
        seoTitle: formData.seoTitle ?? undefined,
        seoDescription: formData.seoDescription ?? undefined,
      };

      const validatedData = updatePostSchema.parse(dataToSubmit);
      await updatePost.mutateAsync({ id: postId, ...validatedData });
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
   * Handles the deletion of a post.
   *
   * This function first checks if the `postId` is null, and if so, it returns early without performing any action.
   * If `postId` is valid, it prompts the user with a confirmation dialog. If the user confirms, it proceeds to delete
   * the post by calling the `mutateAsync` method of `deletePost`, passing the `postId` as an argument.
   */
  const handleDelete = async () => {
    if (postId === null) return;
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      await deletePost.mutateAsync({ id: postId });
    }
  };

  /**
   * Handles the creation of a new category by validating input and triggering a mutation.
   */
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory.mutateAsync({
      name: newCategory.trim(),
      slug: generateSlug(newCategory.trim())
    });
  };

  /**
   * Creates a tag with the trimmed value of `newTag` and its corresponding slug.
   */
  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    await createTag.mutateAsync({
      name: newTag.trim(),
      slug: generateSlug(newTag.trim())
    });
  };

  /**
   * Toggles the inclusion of a category ID in the form data's category IDs array.
   *
   * This function checks if `formData` is truthy. If it is, it updates the `categoryIds`
   * property by either removing or adding the specified `categoryId`, depending on its
   * current presence in the array. If `formData` is falsy, the function does nothing.
   */
  const toggleCategory = (categoryId: number) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    } : null);
  };

  /**
   * Toggles a tag's inclusion in the form data.
   *
   * This function checks if `formData` exists. If it does, it toggles the presence of
   * `tagId` within the `tagIds` array of `formData`. If `tagId` is already present,
   * it removes it; otherwise, it adds it. The updated `formData` is then set using
   * a functional update pattern.
   */
  const toggleTag = (tagId: number) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    } : null);
  };

  if (postLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground mb-4">Post not found</div>
        <Link href="/dashboard/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <p className="text-muted-foreground">
              Last updated {formatDistanceToNow(new Date(post.updatedAt ?? post.createdAt ?? new Date()), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {post.status === "published" && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={updatePost.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSubmit("published")}
            disabled={updatePost.isPending}
          >
            <Eye className="mr-2 h-4 w-4" />
            {formData.status === "published" ? "Update" : "Publish"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Status */}
          <Card>
            <CardHeader>
              <CardTitle>Post Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => prev ? { ...prev, status: value as any } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {post.publishedAt && (
                <p className="text-sm text-muted-foreground mt-2">
                  Published {formatDistanceToNow(new Date(post.publishedAt ?? new Date()), { addSuffix: true })}
                </p>
              )}
            </CardContent>
          </Card>

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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, slug: e.target.value } : null)}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, content: e.target.value } : null)}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, featuredImage: e.target.value } : null)}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, seoTitle: e.target.value } : null)}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, seoDescription: e.target.value } : null)}
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

          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{post.viewCount}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{post.readingTime}</div>
                  <div className="text-sm text-muted-foreground">Reading Time (min)</div>
                </div>
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