/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Users, 
  Calendar, 
  Hash,
  Bookmark,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";

const hashtagSetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hashtags: z.string().min(1, "At least one hashtag is required"),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram", "all"]),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type HashtagSetFormValues = z.infer<typeof hashtagSetSchema>;

interface HashtagSet {
  id: string;
  name: string;
  description: string | null;
  hashtags: unknown;
  platform: string;
  category: string | null;
  tags: unknown;
  isPublic: boolean | null;
  usageCount: number | null;
  avgEngagementRate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const categories = [
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "marketing", label: "Marketing" },
  { value: "health", label: "Health & Fitness" },
  { value: "food", label: "Food & Drink" },
  { value: "travel", label: "Travel" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" }
];

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" }
];

export default function CustomHashtagSets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<HashtagSet | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  
  const utils = api.useUtils();
  
  // Helper functions for type safety
  const getHashtagsArray = (hashtags: unknown): string[] => {
    return Array.isArray(hashtags) ? hashtags as string[] : [];
  };
  
  const getTagsArray = (tags: unknown): string[] => {
    return Array.isArray(tags) ? tags as string[] : [];
  };
  
  // API calls
  const { data: hashtagSets = [] } = api.hashtags.getHashtagSets.useQuery({
    category: selectedCategory,
    platform: selectedPlatform,
  });
  
  const createMutation = api.hashtags.createHashtagSet.useMutation({
    onSuccess: () => {
      toast.success("Hashtag set created successfully!");
      // Refetch data after successful creation
      void utils.hashtags.getHashtagSets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create hashtag set");
    },
  });
  
  const updateMutation = api.hashtags.updateHashtagSet.useMutation({
    onSuccess: () => {
      toast.success("Hashtag set updated successfully!");
      // Refetch data after successful update
      void utils.hashtags.getHashtagSets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update hashtag set");
    },
  });
  
  const deleteMutation = api.hashtags.deleteHashtagSet.useMutation({
    onSuccess: () => {
      toast.success("Hashtag set deleted successfully!");
      // Refetch data after successful deletion
      void utils.hashtags.getHashtagSets.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete hashtag set");
    },
  });

  const form = useForm<HashtagSetFormValues>({
    resolver: zodResolver(hashtagSetSchema),
    defaultValues: {
      name: "",
      description: "",
      hashtags: "",
      platform: "all",
      category: "business",
      tags: "",
      isPublic: false,
    },
  });

  const onSubmit = (values: HashtagSetFormValues) => {
    const hashtagList = values.hashtags.split(/[,\s]+/).filter(Boolean);
    const tagList = values.tags ? values.tags.split(/[,\s]+/).filter(Boolean) : [];
    
    const setData = {
      name: values.name,
      description: values.description ?? "",
      hashtags: hashtagList,
      platform: values.platform,
      category: values.category,
      tags: tagList,
      isPublic: values.isPublic,
    };

    if (editingSet) {
      updateMutation.mutate({
        id: editingSet.id,
        ...setData,
      });
    } else {
      createMutation.mutate(setData);
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingSet(null);
  };

  const handleEdit = (set: HashtagSet) => {
    setEditingSet(set);
    form.setValue("name", set.name);
    form.setValue("description", set.description ?? "");
    form.setValue("hashtags", getHashtagsArray(set.hashtags).join(" "));
    form.setValue("platform", set.platform as HashtagSetFormValues["platform"]);
    form.setValue("category", set.category ?? "");
form.setValue("tags", getTagsArray(set.tags).join(" "));
    form.setValue("isPublic", set.isPublic ?? false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this hashtag set?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCopyHashtags = async (hashtags: string[]) => {
    try {
      await navigator.clipboard.writeText(hashtags.join(" "));
      toast.success("Hashtags copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy hashtags to clipboard");
    }
  };

  // Filter hashtag sets based on selected category and platform
  const filteredSets = hashtagSets.filter((set) => {
    const setCategory = set.category ?? "uncategorized";
    const categoryMatch = selectedCategory === "all" || setCategory === selectedCategory;
    const platformMatch = selectedPlatform === "all" || set.platform === selectedPlatform;
    return categoryMatch && platformMatch;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Set
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSet ? "Edit" : "Create"} Hashtag Set</DialogTitle>
              <DialogDescription>
                {editingSet ? "Update your hashtag set" : "Create a new custom hashtag set for your content"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter set name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe this hashtag set..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {platforms.map(platform => (
                              <SelectItem key={platform.value} value={platform.value}>
                                {platform.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hashtags</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="#hashtag1 #hashtag2 #hashtag3..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter hashtags separated by spaces or commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Add tags to help organize your sets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending ?? updateMutation.isPending}>
                    {editingSet ? "Update Set" : "Create Set"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hashtag Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSets.map((set) => (
          <Card key={set.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{set.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {set.description ?? "No description provided"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(set)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void handleCopyHashtags(getHashtagsArray(set.hashtags))}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Hashtags
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(set.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {set.platform === "all" ? "All Platforms" : set.platform}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {set.category ?? "Uncategorized"}
                </Badge>
                {(set.isPublic ?? false) && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hashtags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const hashtags = getHashtagsArray(set.hashtags);
                    return (
                      <>
                        {hashtags.slice(0, 6).map((hashtag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                        {hashtags.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{hashtags.length - 6} more
                          </Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-primary">{set.usageCount ?? 0}</div>
                  <div className="text-muted-foreground">Uses</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{set.avgEngagementRate ?? "0"}%</div>
                  <div className="text-muted-foreground">Avg Engagement</div>
                </div>
              </div>

              {/* Tags */}
              {(() => {
                const tags = getTagsArray(set.tags);
                return tags.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <Separator />

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(set.updatedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {getHashtagsArray(set.hashtags).length} hashtags
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSets.length === 0 && (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No hashtag sets found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first hashtag set to get started
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Set
          </Button>
        </div>
      )}
    </div>
  );
}