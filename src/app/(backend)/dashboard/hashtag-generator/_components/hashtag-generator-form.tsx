"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Sparkles, Copy, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

const hashtagFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram"]),
  tone: z.enum([
    "casual",
    "professional",
    "trendy",
    "serious",
    "playful",
    "inspirational",
  ]),
  niche: z.string().optional(),
  count: z.number().min(5).max(30).default(10),
  optimizeForPlatform: z.boolean().default(true),
  includeTrending: z.boolean().default(true),
  competitionLevel: z.enum(["low", "medium", "high"]).default("medium"),
});

type HashtagFormValues = z.infer<typeof hashtagFormSchema>;

const platforms = [
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
];

const tones = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "trendy", label: "Trendy" },
  { value: "serious", label: "Serious" },
  { value: "playful", label: "Playful" },
  { value: "inspirational", label: "Inspirational" },
];

export default function HashtagGeneratorForm() {
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = api.generations.generate.useMutation({
    onSuccess: (data) => {
      // Parse hashtags from the generated text
      const hashtags = parseHashtagsFromText(data.text);
      setGeneratedHashtags(hashtags);
      toast.success("Hashtags generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate hashtags");
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const form = useForm<HashtagFormValues>({
    resolver: zodResolver(hashtagFormSchema),
    defaultValues: {
      content: "",
      platform: "twitter",
      tone: "casual",
      niche: "",
      count: 10,
      optimizeForPlatform: true,
      includeTrending: true,
      competitionLevel: "medium",
    },
  });

  const onSubmit = (values: HashtagFormValues) => {
    setIsGenerating(true);

    const getPlatformOptimization = (platform: string) => {
      switch (platform) {
        case "twitter":
          return {
            maxLength: 280,
            optimalCount: "5-10",
            characteristics: "concise, trending, real-time focused",
            avoid: "overly long hashtags, too many hashtags",
            best: "mix of trending and niche, current events",
          };
        case "facebook":
          return {
            maxLength: 63206,
            optimalCount: "2-5",
            characteristics:
              "community-focused, shareable, conversation-starting",
            avoid: "excessive hashtags, overly promotional",
            best: "branded hashtags, community hashtags, event hashtags",
          };
        case "linkedin":
          return {
            maxLength: 3000,
            optimalCount: "3-5",
            characteristics:
              "professional, industry-specific, thought leadership",
            avoid: "casual slang, overly trendy hashtags",
            best: "industry keywords, professional development, business topics",
          };
        case "instagram":
          return {
            maxLength: 2200,
            optimalCount: "8-15",
            characteristics: "visual, lifestyle, discovery-focused",
            avoid: "banned hashtags, shadow-banned terms",
            best: "mix of popular and niche, location-based, lifestyle",
          };
        default:
          return {
            maxLength: 280,
            optimalCount: "5-10",
            characteristics: "engaging, relevant",
            avoid: "irrelevant hashtags",
            best: "targeted, relevant hashtags",
          };
      }
    };

    const platformOpt = getPlatformOptimization(values.platform);

    const prompt = `Generate exactly ${values.count} relevant hashtags for the following content on ${values.platform}:

Content: "${values.content}"
${values.niche ? `Niche/Industry: ${values.niche}` : ""}
Tone: ${values.tone}
Platform: ${values.platform}

${
  values.optimizeForPlatform
    ? `PLATFORM OPTIMIZATION FOR ${values.platform.toUpperCase()}:
- Optimal hashtag count: ${platformOpt.optimalCount}
- Platform characteristics: ${platformOpt.characteristics}
- Avoid: ${platformOpt.avoid}
- Best practices: ${platformOpt.best}
- Competition level preference: ${values.competitionLevel}
`
    : ""
}

${values.includeTrending ? "TRENDING REQUIREMENTS:\n- Include 2-3 currently trending hashtags relevant to the content\n- Balance trending with niche-specific hashtags\n- Ensure trending hashtags align with the content theme\n" : ""}

Requirements:
- Generate exactly ${values.count} hashtags
- Make them relevant to the content and platform
- Use ${values.tone} tone
- ${values.optimizeForPlatform ? `Optimize specifically for ${values.platform} best practices` : "Use general hashtag best practices"}
- ${values.includeTrending ? "Include trending hashtags where appropriate" : "Focus on evergreen hashtags"}
- Competition level: ${values.competitionLevel} (adjust popularity accordingly)
- Format as a simple list of hashtags separated by spaces
- Don't include explanations or additional text
- Return only the hashtags starting with #

Example format: #hashtag1 #hashtag2 #hashtag3`;

    generateMutation.mutate({
      source: values.platform,
      post: prompt,
      tone: values.tone,
      type: "status",
      author: "AI Hashtag Generator",
    });
  };

  const parseHashtagsFromText = (text: string): string[] => {
    const hashtagRegex = /#[\w\d_]+/g;
    const matches = text.match(hashtagRegex) ?? [];
    return matches.slice(0, 30); // Limit to max 30 hashtags
  };

  const copyHashtags = (hashtags: string[]) => {
    const hashtagText = hashtags.join(" ");
    void navigator.clipboard.writeText(hashtagText);
    toast.success("Hashtags copied to clipboard!");
  };

  const copyIndividualHashtag = (hashtag: string) => {
    void navigator.clipboard.writeText(hashtag);
    toast.success(`${hashtag} copied to clipboard!`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Generate Hashtags
          </CardTitle>
          <CardDescription>
            Create engaging hashtags for your social media content using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your social media content or describe what you want hashtags for..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your content or paste your social media post
                    </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem
                              key={platform.value}
                              value={platform.value}
                            >
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
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
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
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niche/Industry (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., fitness, technology, food, travel..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify your niche for more targeted hashtags
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Hashtags</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        max={30}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Generate between 5-30 hashtags (recommended: 10-15)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-medium">
                    Advanced Options
                  </FormLabel>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="optimizeForPlatform"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            Platform Optimization
                          </FormLabel>
                          <FormDescription>
                            Apply platform-specific hashtag best practices
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeTrending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            Include Trending
                          </FormLabel>
                          <FormDescription>
                            Include currently trending hashtags in results
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="competitionLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competition Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select competition level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">
                              Low - Niche hashtags
                            </SelectItem>
                            <SelectItem value="medium">
                              Medium - Balanced mix
                            </SelectItem>
                            <SelectItem value="high">
                              High - Popular hashtags
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose hashtag competition level based on your
                          strategy
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Hashtags
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Generated Hashtags
            </span>
            {generatedHashtags.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyHashtags(generatedHashtags)}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {generatedHashtags.length > 0
              ? `${generatedHashtags.length} hashtags generated. Click to copy individual hashtags.`
              : "Your generated hashtags will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedHashtags.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {generatedHashtags.map((hashtag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                    onClick={() => copyIndividualHashtag(hashtag)}
                  >
                    {hashtag}
                  </Badge>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Copy as text:</p>
                <div className="bg-muted rounded-md p-3">
                  <p className="font-mono text-sm break-all">
                    {generatedHashtags.join(" ")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <Hash className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No hashtags generated yet</p>
              <p className="text-sm">
                Fill out the form and click generate to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
