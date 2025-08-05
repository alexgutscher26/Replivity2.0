/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const bioOptimizerSchema = z.object({
  currentBio: z.string().default(""),
  platform: z.enum(["twitter", "linkedin", "instagram", "facebook", "tiktok", "general"]).default("general"),
  industry: z.string().default(""),
  targetAudience: z.string().default(""),
  goals: z.array(z.string()).default([]),
  tone: z.enum(["professional", "casual", "friendly", "authoritative", "creative", "humorous"]).default("professional"),
});

type BioOptimizerFormValues = z.infer<typeof bioOptimizerSchema>;

interface OptimizationSuggestion {
  type: "improvement" | "warning" | "success";
  title: string;
  description: string;
  example?: string;
}

interface OptimizedBio {
  content: string;
  improvements: string[];
  score: number;
  keywords: string[];
}

export function BioProfileOptimizer() {
  const { user } = useSession();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedBios, setOptimizedBios] = useState<OptimizedBio[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const form = useForm<BioOptimizerFormValues>({
    resolver: zodResolver(bioOptimizerSchema),
    defaultValues: {
      currentBio: "",
      platform: "general",
      industry: "",
      targetAudience: "",
      goals: [],
      tone: "professional",
    },
  });

  const availableGoals = [
    "Increase followers",
    "Drive website traffic",
    "Generate leads",
    "Build brand awareness",
    "Showcase expertise",
    "Network professionally",
    "Promote products/services",
    "Share knowledge",
    "Build community",
    "Personal branding",
  ];

  const platformLimits = {
    twitter: 160,
    linkedin: 220,
    instagram: 150,
    facebook: 101,
    tiktok: 80,
    general: 200,
  };

  const toggleGoal = (goal: string) => {
    const newGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter(g => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(newGoals);
    form.setValue("goals", newGoals);
  };

  const analyzeBio = (bio: string, platform: string) => {
    const suggestions: OptimizationSuggestion[] = [];
    const limit = platformLimits[platform as keyof typeof platformLimits];

    // Length analysis
    if (bio.length === 0) {
      suggestions.push({
        type: "warning",
        title: "Empty Bio",
        description: "Your bio is empty. Add a compelling description to attract your target audience.",
      });
    } else if (bio.length > limit) {
      suggestions.push({
        type: "warning",
        title: "Bio Too Long",
        description: `Your bio exceeds the ${limit} character limit for ${platform}. Consider shortening it.`,
      });
    } else if (bio.length < limit * 0.5) {
      suggestions.push({
        type: "improvement",
        title: "Bio Too Short",
        description: `You have ${limit - bio.length} characters remaining. Consider adding more details about your expertise or goals.`,
      });
    }

    // Content analysis
    const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(bio);
    const hasCallToAction = /\b(follow|contact|visit|check out|dm|message)\b/i.test(bio);

    if (!hasEmoji && platform !== "linkedin") {
      suggestions.push({
        type: "improvement",
        title: "Add Personality",
        description: "Consider adding relevant emojis to make your bio more engaging and visually appealing.",
        example: "🚀 for innovation, 💡 for ideas, 📈 for growth",
      });
    }

    if (!hasCallToAction) {
      suggestions.push({
        type: "improvement",
        title: "Add Call-to-Action",
        description: "Include a clear call-to-action to guide visitors on what to do next.",
        example: "Follow for daily tips | DM for collaborations",
      });
    }

    if (bio.length > 50) {
      suggestions.push({
        type: "success",
        title: "Good Length",
        description: "Your bio has a good length that provides sufficient information.",
      });
    }

    return suggestions;
  };

  const generateOptimizedBios = async (data: BioOptimizerFormValues) => {
    setIsOptimizing(true);
    
    try {
      // Simulate AI optimization (in real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const limit = platformLimits[data.platform];
      const baseContent = data.currentBio || (user?.name ?? "Professional");
      
      const optimizedVersions: OptimizedBio[] = [
        {
          content: `${baseContent} | ${data.industry} Expert | Helping ${data.targetAudience} achieve their goals 🚀`,
          improvements: ["Added industry expertise", "Included target audience", "Added engaging emoji"],
          score: 85,
          keywords: [data.industry, "expert", "goals"],
        },
        {
          content: `🎯 ${data.industry} Professional | ${selectedGoals[0] ?? "Building connections"} | Follow for insights`,
          improvements: ["Clear value proposition", "Call-to-action included", "Professional tone"],
          score: 78,
          keywords: [data.industry, "professional", "insights"],
        },
        {
          content: `${baseContent} - ${data.industry} specialist passionate about ${data.targetAudience} success 💡 Let's connect!`,
          improvements: ["Personal touch", "Shows passion", "Networking focus"],
          score: 82,
          keywords: [data.industry, "specialist", "success"],
        },
      ];

      // Ensure bios fit platform limits
      const fittedBios = optimizedVersions.map(bio => ({
        ...bio,
        content: bio.content.length > limit ? bio.content.substring(0, limit - 3) + "..." : bio.content,
      }));

      setOptimizedBios(fittedBios);
      setSuggestions(analyzeBio(data.currentBio, data.platform));
      
      toast.success("Bio optimization complete!", {
        description: "Generated 3 optimized versions of your bio.",
      });
    } catch (error) {
      toast.error("Optimization failed", {
        description: "Please try again later.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const onSubmit = (data: BioOptimizerFormValues) => {
    void generateOptimizedBios(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Bio & Profile Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your social media bio for maximum impact and engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentBio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Current Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your current bio or leave empty to create from scratch..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Paste your existing bio or leave empty to create a new one.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="twitter">Twitter/X</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Character limit: {platformLimits[form.watch("platform")]}
                      </FormDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry/Field</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Marketing, Tech, Design" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your area of expertise or industry.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., entrepreneurs, students, professionals" {...field} />
                      </FormControl>
                      <FormDescription>
                        Who do you want to reach?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="text-base">Goals</FormLabel>
                <FormDescription className="mb-3">
                  Select your main objectives for your social media presence.
                </FormDescription>
                <div className="flex flex-wrap gap-2">
                  {availableGoals.map((goal) => (
                    <Badge
                      key={goal}
                      variant={selectedGoals.includes(goal) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleGoal(goal)}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isOptimizing} className="w-full">
                {isOptimizing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing Bio...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimize Bio
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Analysis & Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Analysis & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {suggestion.type === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  {suggestion.type === "warning" && (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  )}
                  {suggestion.type === "improvement" && (
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    {suggestion.example && (
                      <p className="text-sm text-blue-600 mt-1 italic">Example: {suggestion.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Bios */}
      {optimizedBios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Optimized Bio Suggestions</h3>
          {optimizedBios.map((bio, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Version {index + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Score: {bio.score}/100</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(bio.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{bio.content}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bio.content.length} characters
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Improvements:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {bio.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Keywords:</h5>
                    <div className="flex flex-wrap gap-1">
                      {bio.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}