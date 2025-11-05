/* eslint-disable @typescript-eslint/no-floating-promises */
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
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Music,
  Globe,
  Info,
  Hash,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";

const bioOptimizerSchema = z.object({
  currentBio: z.string().default(""),
  platform: z
    .enum(["twitter", "linkedin", "instagram", "facebook", "tiktok", "general"])
    .default("general"),
  industry: z.string().default(""),
  targetAudience: z.string().default(""),
  goals: z.array(z.string()).default([]),
  tone: z
    .enum([
      "professional",
      "casual",
      "friendly",
      "authoritative",
      "creative",
      "humorous",
    ])
    .default("professional"),
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
  seoScore?: number;
  keywordDensity?: Record<string, number>;
}

interface KeywordAnalysis {
  suggestedKeywords: string[];
  currentKeywords: string[];
  missingKeywords: string[];
  keywordDensity: Record<string, number>;
  seoScore: number;
  competitorKeywords: string[];
  suggestions: {
    type: "add" | "remove" | "optimize";
    suggestion: string;
  }[];
}

export function BioProfileOptimizer() {
  const { user } = useSession();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedBios, setOptimizedBios] = useState<OptimizedBio[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [keywordAnalysis, setKeywordAnalysis] =
    useState<KeywordAnalysis | null>(null);

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

  // Industry-specific keyword database
  const industryKeywords = {
    marketing: [
      "digital marketing",
      "SEO",
      "content marketing",
      "social media",
      "branding",
      "analytics",
      "campaigns",
      "strategy",
      "growth",
      "ROI",
    ],
    tech: [
      "software development",
      "programming",
      "AI",
      "machine learning",
      "cloud computing",
      "cybersecurity",
      "data science",
      "innovation",
      "automation",
      "scalability",
    ],
    design: [
      "UI/UX",
      "graphic design",
      "creative",
      "visual design",
      "user experience",
      "branding",
      "typography",
      "illustration",
      "prototyping",
      "design thinking",
    ],
    business: [
      "entrepreneurship",
      "leadership",
      "strategy",
      "consulting",
      "management",
      "operations",
      "growth",
      "innovation",
      "productivity",
      "networking",
    ],
    finance: [
      "financial planning",
      "investment",
      "accounting",
      "budgeting",
      "wealth management",
      "risk management",
      "portfolio",
      "analysis",
      "compliance",
      "advisory",
    ],
    healthcare: [
      "patient care",
      "medical",
      "healthcare",
      "wellness",
      "treatment",
      "diagnosis",
      "prevention",
      "health education",
      "clinical",
      "research",
    ],
    education: [
      "teaching",
      "learning",
      "curriculum",
      "education",
      "training",
      "development",
      "mentoring",
      "academic",
      "research",
      "knowledge",
    ],
    sales: [
      "sales",
      "revenue",
      "client relations",
      "negotiation",
      "lead generation",
      "conversion",
      "pipeline",
      "CRM",
      "prospecting",
      "closing",
    ],
    hr: [
      "human resources",
      "talent acquisition",
      "employee engagement",
      "recruitment",
      "performance management",
      "culture",
      "diversity",
      "training",
      "retention",
      "leadership development",
    ],
    consulting: [
      "consulting",
      "advisory",
      "strategy",
      "transformation",
      "optimization",
      "solutions",
      "expertise",
      "implementation",
      "analysis",
      "recommendations",
    ],
  };

  // Platform-specific high-performing keywords
  const platformKeywords = {
    linkedin: [
      "professional",
      "expert",
      "specialist",
      "leader",
      "consultant",
      "advisor",
      "strategist",
      "manager",
      "director",
      "founder",
    ],
    twitter: [
      "creator",
      "influencer",
      "thought leader",
      "expert",
      "enthusiast",
      "advocate",
      "speaker",
      "writer",
      "innovator",
      "pioneer",
    ],
    instagram: [
      "creator",
      "artist",
      "influencer",
      "lifestyle",
      "inspiration",
      "community",
      "passion",
      "creative",
      "authentic",
      "storyteller",
    ],
    facebook: [
      "business",
      "service",
      "community",
      "local",
      "family",
      "trusted",
      "reliable",
      "experienced",
      "professional",
      "friendly",
    ],
    tiktok: [
      "creator",
      "viral",
      "trending",
      "fun",
      "entertaining",
      "creative",
      "original",
      "engaging",
      "popular",
      "authentic",
    ],
    general: [
      "professional",
      "expert",
      "passionate",
      "experienced",
      "dedicated",
      "innovative",
      "creative",
      "reliable",
      "trusted",
      "knowledgeable",
    ],
  };

  const platformConfig = {
    twitter: {
      limit: 160,
      icon: Twitter,
      name: "Twitter/X",
      guidelines: [
        "Keep it concise and punchy",
        "Use relevant hashtags (1-2 max)",
        "Include a call-to-action",
        "Emojis are encouraged",
        "Link to your website or latest content",
      ],
      bestPractices: [
        "Start with your value proposition",
        "Use line breaks for readability",
        "Include your location if relevant",
        "Mention what you tweet about",
      ],
      avoid: [
        "Too many hashtags",
        "Overly promotional language",
        "Generic descriptions",
      ],
    },
    linkedin: {
      limit: 220,
      icon: Linkedin,
      name: "LinkedIn",
      guidelines: [
        "Professional tone is essential",
        "Highlight your expertise and achievements",
        "Include industry keywords",
        "Mention your current role",
        "Add a professional call-to-action",
      ],
      bestPractices: [
        "Start with your current position",
        "Include years of experience",
        "Mention key skills or specializations",
        "Add contact information",
        "Use industry-specific terminology",
      ],
      avoid: [
        "Casual language or slang",
        "Too many emojis",
        "Personal information",
        "Controversial topics",
      ],
    },
    instagram: {
      limit: 150,
      icon: Instagram,
      name: "Instagram",
      guidelines: [
        "Visual and creative approach",
        "Use emojis strategically",
        "Include relevant hashtags",
        "Add your website link",
        "Show personality",
      ],
      bestPractices: [
        "Use line breaks for visual appeal",
        "Include what you post about",
        "Add location if relevant",
        "Use branded hashtags",
        "Include contact info",
      ],
      avoid: [
        "Wall of text",
        "Too many hashtags in bio",
        "Unclear value proposition",
      ],
    },
    facebook: {
      limit: 101,
      icon: Facebook,
      name: "Facebook",
      guidelines: [
        "Friendly and approachable tone",
        "Include business hours if applicable",
        "Add contact information",
        "Mention your services/products",
        "Use local keywords if relevant",
      ],
      bestPractices: [
        "Include your mission statement",
        "Add location and contact details",
        "Mention what makes you unique",
        "Include website link",
      ],
      avoid: [
        "Too much promotional content",
        "Overly formal language",
        "Missing contact information",
      ],
    },
    tiktok: {
      limit: 80,
      icon: Music,
      name: "TikTok",
      guidelines: [
        "Fun and engaging tone",
        "Use trending hashtags",
        "Keep it short and catchy",
        "Include what content you create",
        "Add posting schedule if consistent",
      ],
      bestPractices: [
        "Use emojis creatively",
        "Include your niche/content type",
        "Add posting frequency",
        "Use trending phrases",
      ],
      avoid: ["Overly serious tone", "Too much text", "Boring descriptions"],
    },
    general: {
      limit: 200,
      icon: Globe,
      name: "General",
      guidelines: [
        "Adaptable for multiple platforms",
        "Clear value proposition",
        "Professional yet approachable",
        "Include key information",
        "Easy to customize",
      ],
      bestPractices: [
        "Focus on your expertise",
        "Include contact information",
        "Mention your goals",
        "Keep it versatile",
      ],
      avoid: [
        "Platform-specific references",
        "Too casual or too formal",
        "Overly long descriptions",
      ],
    },
  };

  const toggleGoal = (goal: string) => {
    const newGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(newGoals);
    form.setValue("goals", newGoals);
  };

  const analyzeKeywords = (
    bio: string,
    industry: string,
    platform: string,
  ): KeywordAnalysis => {
    const words = bio
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);
    const currentKeywords = [...new Set(words)];

    // Get industry-specific keywords
    const industryKey = industry.toLowerCase().replace(/\s+/g, "");
    const relevantIndustryKeywords =
      industryKeywords[industryKey as keyof typeof industryKeywords] || [];

    // Get platform-specific keywords
    const relevantPlatformKeywords =
      platformKeywords[platform as keyof typeof platformKeywords] || [];

    // Combine suggested keywords
    const suggestedKeywords = [
      ...new Set([
        ...relevantIndustryKeywords.slice(0, 8),
        ...relevantPlatformKeywords.slice(0, 5),
        industry.toLowerCase(),
        ...selectedGoals.map((goal) => goal.toLowerCase()),
      ]),
    ];

    // Find missing keywords
    const missingKeywords = suggestedKeywords.filter(
      (keyword) => !bio.toLowerCase().includes(keyword.toLowerCase()),
    );

    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    suggestedKeywords.forEach((keyword) => {
      const regex = new RegExp(keyword.replace(/\s+/g, "\\s+"), "gi");
      const matches = bio.match(regex);
      keywordDensity[keyword] = matches ? matches.length : 0;
    });

    // Calculate SEO score (0-100)
    const keywordScore =
      ((suggestedKeywords.length - missingKeywords.length) /
        suggestedKeywords.length) *
      40;
    const densityScore = Object.values(keywordDensity).reduce(
      (sum, count) => sum + Math.min(count * 10, 30),
      0,
    );
    const lengthScore = bio.length > 50 ? 20 : (bio.length / 50) * 20;
    const seoScore = Math.min(
      Math.round(keywordScore + densityScore + lengthScore),
      100,
    );

    // Generate competitor keywords (simulated)
    const competitorKeywords = [
      "industry leader",
      "top performer",
      "award-winning",
      "certified",
      "experienced",
      "results-driven",
      "innovative solutions",
      "client-focused",
      "proven track record",
    ].slice(0, 5);

    // Generate optimization suggestions
    const suggestions = [];

    if (missingKeywords.length > 0) {
      suggestions.push({
        type: "add" as const,
        suggestion: `Consider adding these high-impact keywords: ${missingKeywords.slice(0, 3).join(", ")}`,
      });
    }

    if (seoScore < 60) {
      suggestions.push({
        type: "optimize" as const,
        suggestion:
          "Your bio could benefit from more industry-specific keywords to improve discoverability",
      });
    }

    if (Object.values(keywordDensity).some((density) => density > 3)) {
      suggestions.push({
        type: "remove" as const,
        suggestion:
          "Some keywords appear too frequently. Consider varying your language for better readability",
      });
    }

    if (bio.length < 50) {
      suggestions.push({
        type: "add" as const,
        suggestion:
          "Your bio is quite short. Adding more relevant keywords could improve your professional presence",
      });
    }

    return {
      suggestedKeywords,
      currentKeywords: currentKeywords.slice(0, 10),
      missingKeywords: missingKeywords.slice(0, 8),
      keywordDensity,
      seoScore,
      competitorKeywords,
      suggestions,
    };
  };

  const optimizeKeywordsInBio = (
    bio: string,
    keywords: string[],
    platform: string,
  ): string => {
    let optimizedBio = bio;
    const config = platformConfig[platform as keyof typeof platformConfig];
    const limit = config.limit;

    // Add missing high-priority keywords if there's space
    const highPriorityKeywords = keywords.slice(0, 3);

    for (const keyword of highPriorityKeywords) {
      if (!optimizedBio.toLowerCase().includes(keyword.toLowerCase())) {
        const addition = ` | ${keyword}`;
        if (optimizedBio.length + addition.length <= limit) {
          optimizedBio += addition;
        }
      }
    }

    return optimizedBio;
  };

  const generatePlatformSpecificBios = (
    data: BioOptimizerFormValues,
    baseContent: string,
    limit?: number,
  ): OptimizedBio[] => {
    const bios: OptimizedBio[] = [];

    // Get keyword analysis for optimization
    const keywordAnalysis = analyzeKeywords(
      data.currentBio,
      data.industry,
      data.platform,
    );
    const topKeywords = keywordAnalysis.suggestedKeywords.slice(0, 5);

    // Platform-specific bio generation logic with keyword optimization
    switch (data.platform) {
      case "twitter":
        bios.push(
          {
            content: optimizeKeywordsInBio(
              `${baseContent} | ${data.industry} insights 🧵 | ${selectedGoals[0] ?? "Building connections"} | Follow for daily tips`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Added thread emoji for Twitter culture",
              "Included daily posting promise",
              "Clear value proposition",
              "Optimized keywords",
            ],
            score: 88,
            keywords: [
              data.industry,
              "insights",
              "tips",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 10,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
          {
            content: optimizeKeywordsInBio(
              `🚀 ${data.industry} expert helping ${data.targetAudience} | Tweets about trends & strategies | DM for collabs`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Rocket emoji for growth",
              "Clear target audience",
              "Call-to-action for DMs",
              "SEO optimized",
            ],
            score: 85,
            keywords: [
              data.industry,
              "expert",
              "trends",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 8,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
        );
        break;

      case "linkedin":
        bios.push(
          {
            content: optimizeKeywordsInBio(
              `${data.industry} Professional | Helping ${data.targetAudience} achieve ${selectedGoals[0] ?? "success"} | 5+ years experience | Connect for industry insights`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Professional tone",
              "Experience highlighted",
              "Clear networking CTA",
              "Industry keywords included",
            ],
            score: 92,
            keywords: [
              data.industry,
              "professional",
              "experience",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 15,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
          {
            content: optimizeKeywordsInBio(
              `Senior ${data.industry} Specialist | Passionate about ${data.targetAudience} growth | Speaker & Consultant | Let's connect and share insights`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Authority positioning",
              "Multiple credentials",
              "Collaborative tone",
              "Keyword optimized",
            ],
            score: 89,
            keywords: [
              "senior",
              data.industry,
              "specialist",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 12,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
        );
        break;

      case "instagram":
        bios.push(
          {
            content: optimizeKeywordsInBio(
              `✨ ${data.industry} Creator\n🎯 Helping ${data.targetAudience}\n📍 [Your City]\n👇 Latest content`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Visual line breaks",
              "Emojis for engagement",
              "Location included",
              "Trending keywords",
            ],
            score: 87,
            keywords: [
              data.industry,
              "creator",
              "content",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 9,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
          {
            content: optimizeKeywordsInBio(
              `${baseContent} 💫\n${data.industry} tips & inspiration\n${selectedGoals[0] ?? "Building community"} daily\n🔗 Link below`,
              topKeywords,
              data.platform,
            ),
            improvements: [
              "Personal branding",
              "Daily content promise",
              "Link direction",
              "SEO enhanced",
            ],
            score: 84,
            keywords: [
              data.industry,
              "tips",
              "inspiration",
              ...topKeywords.slice(0, 2),
            ],
            seoScore: keywordAnalysis.seoScore + 7,
            keywordDensity: keywordAnalysis.keywordDensity,
          },
        );
        break;

      case "facebook":
        bios.push({
          content: optimizeKeywordsInBio(
            `${data.industry} business helping ${data.targetAudience} succeed. Contact us for ${selectedGoals[0] ?? "consultation"}. Open Mon-Fri 9-5.`,
            topKeywords,
            data.platform,
          ),
          improvements: [
            "Business focus",
            "Contact information",
            "Operating hours",
            "Local SEO keywords",
          ],
          score: 86,
          keywords: [
            data.industry,
            "business",
            "contact",
            ...topKeywords.slice(0, 2),
          ],
          seoScore: keywordAnalysis.seoScore + 11,
          keywordDensity: keywordAnalysis.keywordDensity,
        });
        break;

      case "tiktok":
        bios.push({
          content: optimizeKeywordsInBio(
            `${data.industry} content 🔥\nDaily tips for ${data.targetAudience}\nNew videos every day!`,
            topKeywords,
            data.platform,
          ),
          improvements: [
            "Fire emoji for trending",
            "Daily posting schedule",
            "Excitement tone",
            "Viral keywords",
          ],
          score: 83,
          keywords: [
            data.industry,
            "content",
            "daily",
            ...topKeywords.slice(0, 2),
          ],
          seoScore: keywordAnalysis.seoScore + 6,
          keywordDensity: keywordAnalysis.keywordDensity,
        });
        break;

      default:
        bios.push({
          content: optimizeKeywordsInBio(
            `${baseContent} | ${data.industry} Expert | Helping ${data.targetAudience} achieve their goals`,
            topKeywords,
            data.platform,
          ),
          improvements: [
            "Clear expertise",
            "Target audience focus",
            "Goal-oriented",
            "Keyword optimized",
          ],
          score: 80,
          keywords: [
            data.industry,
            "expert",
            "goals",
            ...topKeywords.slice(0, 2),
          ],
          seoScore: keywordAnalysis.seoScore + 5,
          keywordDensity: keywordAnalysis.keywordDensity,
        });
    }

    // Add a keyword-optimized generic option for all platforms
    bios.push({
      content: optimizeKeywordsInBio(
        `${baseContent} - ${data.industry} specialist passionate about ${data.targetAudience} success. Let's connect!`,
        topKeywords,
        data.platform,
      ),
      improvements: [
        "Personal touch",
        "Shows passion",
        "Networking focus",
        "SEO optimized",
      ],
      score: 82,
      keywords: [
        data.industry,
        "specialist",
        "success",
        ...topKeywords.slice(0, 2),
      ],
      seoScore: keywordAnalysis.seoScore + 8,
      keywordDensity: keywordAnalysis.keywordDensity,
    });

    return bios;
  };

  const analyzeBio = (bio: string, platform: string) => {
    const suggestions: OptimizationSuggestion[] = [];
    const config = platformConfig[platform as keyof typeof platformConfig];
    const limit = config.limit;

    // Length analysis
    if (bio.length === 0) {
      suggestions.push({
        type: "warning",
        title: "Empty Bio",
        description:
          "Your bio is empty. Add a compelling description to attract your target audience.",
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

    // Platform-specific content analysis
    const hasEmoji =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
        bio,
      );
    const hasURL = /https?:\/\//.test(bio);
    const hasCallToAction =
      /\b(follow|contact|visit|check out|dm|message|connect|collaborate)\b/i.test(
        bio,
      );
    const hasLineBreaks = bio.includes("\n");
    const hasLocation = /\b(\w+,\s*\w+|📍)/u.test(bio);
    const hasRole =
      /\b(ceo|founder|manager|director|specialist|expert|consultant)\b/i.test(
        bio,
      );

    // Platform-specific suggestions
    if (platform === "linkedin") {
      if (!hasRole) {
        suggestions.push({
          type: "improvement",
          title: "Add Professional Title",
          description:
            "LinkedIn bios should include your current role or professional title.",
          example: "Senior Marketing Manager | Digital Strategy Expert",
        });
      }
      if (hasEmoji) {
        suggestions.push({
          type: "warning",
          title: "Limit Emojis",
          description:
            "LinkedIn favors a professional tone. Use emojis sparingly.",
        });
      }
    } else if (platform === "instagram") {
      if (!hasEmoji) {
        suggestions.push({
          type: "improvement",
          title: "Add Visual Elements",
          description:
            "Instagram bios benefit from emojis and visual elements.",
          example: "✨ Creator | 📸 Daily inspiration | 🌟 Your niche",
        });
      }
      if (!hasLineBreaks && bio.length > 50) {
        suggestions.push({
          type: "improvement",
          title: "Use Line Breaks",
          description:
            "Break up your bio with line breaks for better readability on Instagram.",
        });
      }
    } else if (platform === "twitter") {
      if (!hasEmoji) {
        suggestions.push({
          type: "improvement",
          title: "Add Personality",
          description:
            "Twitter bios benefit from emojis to show personality and save space.",
          example: "🚀 for innovation, 💡 for ideas, 📈 for growth",
        });
      }
      const hashtagCount = (bio.match(/#\w+/g) ?? []).length;
      if (hashtagCount > 2) {
        suggestions.push({
          type: "warning",
          title: "Too Many Hashtags",
          description:
            "Limit hashtags to 1-2 in your Twitter bio for better readability.",
        });
      }
    } else if (platform === "facebook") {
      if (!hasLocation && !hasURL) {
        suggestions.push({
          type: "improvement",
          title: "Add Contact Information",
          description:
            "Facebook bios should include location or website for business purposes.",
        });
      }
    } else if (platform === "tiktok") {
      if (!hasEmoji) {
        suggestions.push({
          type: "improvement",
          title: "Make It Fun",
          description:
            "TikTok bios should be fun and engaging with emojis and creative language.",
        });
      }
    }

    // Universal suggestions
    if (!hasCallToAction) {
      const platformCTA = {
        twitter: "Follow for daily tips | DM for collaborations",
        linkedin: "Connect for industry insights | Message for opportunities",
        instagram: "Follow for inspiration | DM for collabs",
        facebook: "Message us for inquiries | Visit our website",
        tiktok: "Follow for daily content | Comment your thoughts",
        general: "Connect with me | Let's collaborate",
      };

      suggestions.push({
        type: "improvement",
        title: "Add Call-to-Action",
        description:
          "Include a clear call-to-action to guide visitors on what to do next.",
        example:
          platformCTA[platform as keyof typeof platformCTA] ||
          platformCTA.general,
      });
    }

    if (bio.length > 50 && bio.length <= limit * 0.8) {
      suggestions.push({
        type: "success",
        title: "Good Length",
        description:
          "Your bio has a good length that provides sufficient information without being overwhelming.",
      });
    }

    return suggestions;
  };

  const generateOptimizedBios = async (data: BioOptimizerFormValues) => {
    setIsOptimizing(true);

    try {
      // Simulate AI optimization (in real implementation, this would call an AI service)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const config = platformConfig[data.platform];
      const limit = config.limit;
      const baseContent = data.currentBio || (user?.name ?? "Professional");

      // Generate platform-specific optimized bios
      const platformSpecificBios = generatePlatformSpecificBios(
        data,
        baseContent,
        limit,
      );

      // Ensure bios fit platform limits
      const fittedBios = platformSpecificBios.map((bio) => ({
        ...bio,
        content:
          bio.content.length > limit
            ? bio.content.substring(0, limit - 3) + "..."
            : bio.content,
      }));

      setOptimizedBios(fittedBios);
      setSuggestions(analyzeBio(data.currentBio, data.platform));

      toast.success("Bio optimization complete!", {
        description: `Generated ${fittedBios.length} platform-specific optimized versions of your bio.`,
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
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const onSubmit = async (data: BioOptimizerFormValues) => {
    setIsOptimizing(true);
    setSuggestions([]);
    setOptimizedBios([]);
    setKeywordAnalysis(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate keyword analysis
      const keywordInsights = analyzeKeywords(
        data.currentBio,
        data.industry,
        data.platform,
      );
      setKeywordAnalysis(keywordInsights);

      // Generate analysis and suggestions
      const optimizationSuggestions = analyzeBio(
        data.currentBio,
        data.platform,
      );
      setSuggestions(optimizationSuggestions);

      // Generate optimized bios
      await generateOptimizedBios(data);
    } catch (error) {
      toast.error("Optimization failed", {
        description: "Please try again later.",
      });
    } finally {
      setIsOptimizing(false);
    }
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        Paste your existing bio or leave empty to create a new
                        one.
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
                          {Object.entries(platformConfig).map(
                            ([key, config]) => {
                              const IconComponent = config.icon;
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {config.name}
                                  </div>
                                </SelectItem>
                              );
                            },
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Character limit:{" "}
                        {platformConfig[form.watch("platform")]?.limit ||
                          "Select platform"}
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
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">
                            Authoritative
                          </SelectItem>
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
                        <Input
                          placeholder="e.g., Marketing, Tech, Design"
                          {...field}
                        />
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
                        <Input
                          placeholder="e.g., entrepreneurs, students, professionals"
                          {...field}
                        />
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
                      variant={
                        selectedGoals.includes(goal) ? "default" : "outline"
                      }
                      className="hover:bg-primary/80 cursor-pointer"
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
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {suggestion.type === "success" && (
                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  )}
                  {suggestion.type === "warning" && (
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                  )}
                  {suggestion.type === "improvement" && (
                    <TrendingUp className="mt-0.5 h-5 w-5 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-muted-foreground text-sm">
                      {suggestion.description}
                    </p>
                    {suggestion.example && (
                      <p className="mt-1 text-sm text-blue-600 italic">
                        Example: {suggestion.example}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Guidelines */}
      {form.watch("platform") && platformConfig[form.watch("platform")] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              {platformConfig[form.watch("platform")]?.name || "Platform"}{" "}
              Guidelines
            </CardTitle>
            <CardDescription>
              Platform-specific best practices and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-medium text-green-600">
                  Best Practices
                </h4>
                <ul className="space-y-1 text-sm">
                  {(
                    platformConfig[form.watch("platform")]?.bestPractices || []
                  ).map((practice, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-1 h-3 w-3 flex-shrink-0 text-green-500" />
                      {practice}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-blue-600">Guidelines</h4>
                <ul className="space-y-1 text-sm">
                  {(
                    platformConfig[form.watch("platform")]?.guidelines || []
                  ).map((guideline, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="mt-1 h-3 w-3 flex-shrink-0 text-blue-500" />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-red-600">Avoid</h4>
                <ul className="space-y-1 text-sm">
                  {(platformConfig[form.watch("platform")]?.avoid || []).map(
                    (item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="mt-1 h-3 w-3 flex-shrink-0 text-red-500" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Analysis */}
      {keywordAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-purple-500" />
              Keyword Analysis & SEO Insights
            </CardTitle>
            <CardDescription>
              Optimize your bio with industry-relevant keywords for better
              discoverability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="mb-3 font-medium text-purple-600">SEO Score</h4>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16">
                    <svg
                      className="h-16 w-16 -rotate-90 transform"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={
                          keywordAnalysis.seoScore >= 80
                            ? "#10b981"
                            : keywordAnalysis.seoScore >= 60
                              ? "#f59e0b"
                              : "#ef4444"
                        }
                        strokeWidth="3"
                        strokeDasharray={`${keywordAnalysis.seoScore}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {keywordAnalysis.seoScore}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {keywordAnalysis.seoScore >= 80
                        ? "Excellent"
                        : keywordAnalysis.seoScore >= 60
                          ? "Good"
                          : "Needs Improvement"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      SEO Optimization
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-blue-600">
                  Suggested Keywords
                </h4>
                <div className="space-y-2">
                  {(keywordAnalysis.suggestedKeywords || [])
                    .slice(0, 6)
                    .map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{keyword}</span>
                        <Badge variant="outline" className="text-xs">
                          {index < 2 ? "High" : index < 4 ? "Medium" : "Low"}{" "}
                          Priority
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-green-600">
                  Keyword Density
                </h4>
                <div className="space-y-2">
                  {Object.entries(keywordAnalysis.keywordDensity || {})
                    .slice(0, 5)
                    .map(([keyword, density], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{keyword}</span>
                        <span className="text-muted-foreground">
                          {(density * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 font-medium">Optimization Suggestions</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(keywordAnalysis.suggestions || []).map(
                  (suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {suggestion.type === "add"
                            ? "Add Keywords"
                            : suggestion.type === "remove"
                              ? "Remove Keywords"
                              : "Optimize Keywords"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Bios */}
      {optimizedBios.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Platform-Specific Bio Suggestions
          </h3>
          {optimizedBios.map((bio, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Version {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Score: {bio.score}/100</Badge>
                    {bio.seoScore && (
                      <Badge variant="outline" className="text-purple-600">
                        SEO: {bio.seoScore}/100
                      </Badge>
                    )}
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
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-medium">{bio.content}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {bio.content.length} characters
                    </p>
                  </div>

                  <div>
                    <h5 className="mb-2 font-medium">Improvements:</h5>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      {(bio.improvements || []).map((improvement, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h5 className="mb-2 font-medium">Keywords:</h5>
                      <div className="flex flex-wrap gap-1">
                        {(bio.keywords || []).map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {bio.keywordDensity && (
                      <div>
                        <h5 className="mb-2 font-medium">
                          Top Keyword Density:
                        </h5>
                        <div className="space-y-1">
                          {Object.entries(bio.keywordDensity || {})
                            .slice(0, 3)
                            .map(([keyword, density], i) => (
                              <div
                                key={i}
                                className="flex justify-between text-xs"
                              >
                                <span className="truncate">{keyword}</span>
                                <span className="text-muted-foreground">
                                  {(density * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
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
