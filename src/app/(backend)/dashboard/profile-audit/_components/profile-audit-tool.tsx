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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Heart,
  Target,
  Zap,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,

  Sparkles,
  Download,
  Video,
  ExternalLink,
  Image as ImageIcon,
  Hash,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";

// Schema for form validation
const profileAuditSchema = z.object({
  platform: z.enum(["instagram", "twitter", "linkedin", "facebook", "youtube", "tiktok"]),
  profileUrl: z.string().url("Please enter a valid profile URL"),
  analysisType: z.enum(["basic", "comprehensive", "competitive"]),
  includeCompetitors: z.boolean().default(false),
  competitorUrls: z.array(z.string().url()).optional(),
});

type ProfileAuditFormValues = z.infer<typeof profileAuditSchema>;

interface ProfileMetrics {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  reachRate: number;
  growthRate: number;
}

interface ProfileAnalysis {
  overallScore: number;
  profileCompleteness: {
    score: number;
    items: {
      name: string;
      status: "complete" | "incomplete" | "needs_improvement";
      suggestion: string;
    }[];
  };
  contentQuality: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  engagement: {
    score: number;
    rate: number;
    benchmark: number;
    trend: "up" | "down" | "stable";
    suggestions: string[];
  };
  posting: {
    score: number;
    frequency: string;
    consistency: number;
    bestTimes: string[];
    suggestions: string[];
  };
  hashtags: {
    score: number;
    usage: number;
    effectiveness: number;
    topPerforming: string[];
    suggestions: string[];
  };
  audience: {
    score: number;
    demographics: {
      ageGroups: { range: string; percentage: number }[];
      genders: { type: string; percentage: number }[];
      locations: { country: string; percentage: number }[];
    };
    insights: string[];
  };
  competitors: {
    analysis: {
      name: string;
      followers: number;
      engagement: number;
      strengths: string[];
      opportunities: string[];
    }[];
    insights: string[];
  } | null;
  actionPlan: {
    priority: "high" | "medium" | "low";
    category: string;
    action: string;
    impact: string;
    effort: "low" | "medium" | "high";
    timeline: string;
  }[];
}

// Platform configurations
const platformConfig = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
    metrics: ["followers", "posts", "engagement", "reach"],
  },
  twitter: {
    name: "Twitter/X",
    icon: Twitter,
    color: "#1DA1F2",
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
    metrics: ["followers", "tweets", "engagement", "impressions"],
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "#0077B5",
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/,
    metrics: ["connections", "posts", "engagement", "views"],
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "#1877F2",
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
    metrics: ["followers", "posts", "engagement", "reach"],
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "#FF0000",
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/|@)[a-zA-Z0-9_-]+\/?$/,
    metrics: ["subscribers", "videos", "views", "engagement"],
  },
  tiktok: {
    name: "TikTok",
    icon: Video,
    color: "#000000",
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/,
    metrics: ["followers", "videos", "likes", "views"],
  },
};

// Score color mapping

const getScoreBadgeVariant = (score: number) => {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
};

export function ProfileAuditTool() {
  useSession();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [profileMetrics, setProfileMetrics] = useState<ProfileMetrics | null>(null);

  const form = useForm<ProfileAuditFormValues>({
    resolver: zodResolver(profileAuditSchema),
    defaultValues: {
      platform: "instagram",
      profileUrl: "",
      analysisType: "comprehensive",
      includeCompetitors: false,
      competitorUrls: [],
    },
  });

  const selectedPlatform = form.watch("platform");

  const analyzeProfile = async (data: ProfileAuditFormValues) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock analysis data
      const mockMetrics: ProfileMetrics = {
        followers: Math.floor(Math.random() * 50000) + 1000,
        following: Math.floor(Math.random() * 2000) + 100,
        posts: Math.floor(Math.random() * 500) + 50,
        engagement: Math.random() * 8 + 1,
        avgLikes: Math.floor(Math.random() * 1000) + 50,
        avgComments: Math.floor(Math.random() * 100) + 5,
        avgShares: Math.floor(Math.random() * 50) + 2,
        reachRate: Math.random() * 15 + 5,
        growthRate: Math.random() * 10 - 2,
      };
      
      const mockAnalysis: ProfileAnalysis = {
        overallScore: Math.floor(Math.random() * 40) + 60,
        profileCompleteness: {
          score: Math.floor(Math.random() * 30) + 70,
          items: [
            {
              name: "Profile Picture",
              status: "complete",
              suggestion: "Great! You have a clear, professional profile picture.",
            },
            {
              name: "Bio Description",
              status: "needs_improvement",
              suggestion: "Add more keywords and a clear call-to-action to your bio.",
            },
            {
              name: "Contact Information",
              status: "incomplete",
              suggestion: "Add your email or website link for better accessibility.",
            },
            {
              name: "Link in Bio",
              status: "complete",
              suggestion: "Good! You're utilizing the link in bio effectively.",
            },
            {
              name: "Story Highlights",
              status: data.platform === "instagram" ? "needs_improvement" : "complete",
              suggestion: data.platform === "instagram" ? "Create more story highlights to showcase your content categories." : "Not applicable for this platform.",
            },
          ],
        },
        contentQuality: {
          score: Math.floor(Math.random() * 25) + 65,
          strengths: [
            "Consistent visual style and branding",
            "High-quality images and videos",
            "Engaging captions with clear messaging",
          ],
          weaknesses: [
            "Limited content variety",
            "Inconsistent posting schedule",
            "Low user-generated content",
          ],
          suggestions: [
            "Diversify content types (carousel, video, stories)",
            "Implement a content calendar for consistency",
            "Encourage user-generated content with branded hashtags",
            "Add more behind-the-scenes content",
          ],
        },
        engagement: {
          score: Math.floor(Math.random() * 35) + 55,
          rate: mockMetrics.engagement,
          benchmark: 3.5,
          trend: Math.random() > 0.5 ? "up" : "down",
          suggestions: [
            "Ask more questions in your captions",
            "Respond to comments within 2 hours",
            "Use interactive story features (polls, questions)",
            "Post when your audience is most active",
          ],
        },
        posting: {
          score: Math.floor(Math.random() * 30) + 60,
          frequency: "4-5 posts per week",
          consistency: Math.floor(Math.random() * 40) + 60,
          bestTimes: ["9:00 AM", "1:00 PM", "7:00 PM"],
          suggestions: [
            "Maintain consistent posting schedule",
            "Post during peak audience hours",
            "Plan content in advance using scheduling tools",
            "Balance promotional and value-driven content",
          ],
        },
        hashtags: {
          score: Math.floor(Math.random() * 25) + 65,
          usage: Math.floor(Math.random() * 20) + 10,
          effectiveness: Math.floor(Math.random() * 30) + 60,
          topPerforming: ["#digitalmarketing", "#socialmedia", "#contentcreator", "#business", "#entrepreneur"],
          suggestions: [
            "Use a mix of popular and niche hashtags",
            "Research trending hashtags in your industry",
            "Create a branded hashtag for your community",
            "Avoid overused or banned hashtags",
          ],
        },
        audience: {
          score: Math.floor(Math.random() * 20) + 75,
          demographics: {
            ageGroups: [
              { range: "18-24", percentage: 25 },
              { range: "25-34", percentage: 45 },
              { range: "35-44", percentage: 20 },
              { range: "45+", percentage: 10 },
            ],
            genders: [
              { type: "Female", percentage: 60 },
              { type: "Male", percentage: 38 },
              { type: "Other", percentage: 2 },
            ],
            locations: [
              { country: "United States", percentage: 45 },
              { country: "United Kingdom", percentage: 20 },
              { country: "Canada", percentage: 15 },
              { country: "Australia", percentage: 10 },
              { country: "Other", percentage: 10 },
            ],
          },
          insights: [
            "Your audience is primarily millennials interested in professional development",
            "High engagement from users in major English-speaking markets",
            "Strong female audience suggests lifestyle and wellness content performs well",
          ],
        },
        competitors: data.includeCompetitors ? {
          analysis: [
            {
              name: "@competitor1",
              followers: 75000,
              engagement: 4.2,
              strengths: ["Consistent branding", "High-quality visuals", "Strong community engagement"],
              opportunities: ["Limited video content", "Infrequent posting", "Weak story utilization"],
            },
            {
              name: "@competitor2",
              followers: 45000,
              engagement: 6.1,
              strengths: ["Viral content creation", "Trend adoption", "User-generated content"],
              opportunities: ["Inconsistent messaging", "Poor bio optimization", "Limited link strategy"],
            },
          ],
          insights: [
            "Competitors are focusing heavily on video content",
            "There's an opportunity to dominate the educational content space",
            "Your engagement rate is competitive but has room for improvement",
          ],
        } : null,
        actionPlan: [
          {
            priority: "high",
            category: "Profile Optimization",
            action: "Update bio with clear value proposition and call-to-action",
            impact: "Increase profile conversion rate by 25%",
            effort: "low",
            timeline: "This week",
          },
          {
            priority: "high",
            category: "Content Strategy",
            action: "Create content calendar with diverse post types",
            impact: "Improve engagement rate by 15%",
            effort: "medium",
            timeline: "Next 2 weeks",
          },
          {
            priority: "medium",
            category: "Engagement",
            action: "Implement daily comment response strategy",
            impact: "Boost community engagement by 30%",
            effort: "medium",
            timeline: "Ongoing",
          },
          {
            priority: "medium",
            category: "Hashtag Strategy",
            action: "Research and implement niche hashtag sets",
            impact: "Increase discoverability by 20%",
            effort: "low",
            timeline: "Next week",
          },
          {
            priority: "low",
            category: "Analytics",
            action: "Set up comprehensive tracking and reporting",
            impact: "Better data-driven decisions",
            effort: "high",
            timeline: "Next month",
          },
        ],
      };
      
      setProfileMetrics(mockMetrics);
      setAnalysis(mockAnalysis);
      
      toast.success("Profile analysis completed!", {
        description: "Your comprehensive audit is ready with actionable insights.",
      });
    } catch (error) {
      toast.error("Analysis failed", {
        description: "Please try again later.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    if (!analysis || !profileMetrics) return;
    
    const reportData = {
      profile: form.getValues(),
      metrics: profileMetrics,
      analysis,
      generatedAt: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-audit-${selectedPlatform}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully!");
  };

  const onSubmit = async (data: ProfileAuditFormValues) => {
    await analyzeProfile(data);
  };

  const PlatformIcon = platformConfig[selectedPlatform].icon;

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Profile Analysis Setup
          </CardTitle>
          <CardDescription>
            Enter your profile details to get a comprehensive audit with actionable suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {Object.entries(platformConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="h-4 w-4" style={{ color: config.color }} />
                                {config.name}
                              </div>
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
                  name="analysisType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analysis Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select analysis type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic Analysis</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                          <SelectItem value="competitive">Competitive Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Comprehensive includes detailed insights, competitive adds competitor comparison.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="profileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <PlatformIcon className="h-4 w-4" style={{ color: platformConfig[selectedPlatform].color }} />
                      {platformConfig[selectedPlatform].name} Profile URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`https://${selectedPlatform === 'twitter' ? 'x.com' : selectedPlatform + '.com'}/yourprofile`} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the full URL to your {platformConfig[selectedPlatform].name} profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className="min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing Profile...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Profile
                    </>
                  )}
                </Button>
                
                {analysis && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" onClick={() => window.open(form.getValues("profileUrl"), '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && profileMetrics && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Overall Profile Score
                </span>
                <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="text-lg px-3 py-1">
                  {analysis.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={analysis.overallScore} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{profileMetrics.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{profileMetrics.engagement.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{profileMetrics.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      profileMetrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profileMetrics.growthRate > 0 ? '+' : ''}{profileMetrics.growthRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Completeness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Profile Completeness
                  </span>
                  <Badge variant={getScoreBadgeVariant(analysis.profileCompleteness.score)}>
                    {analysis.profileCompleteness.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.profileCompleteness.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {item.status === "complete" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : item.status === "needs_improvement" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.suggestion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Content Quality
                  </span>
                  <Badge variant={getScoreBadgeVariant(analysis.contentQuality.score)}>
                    {analysis.contentQuality.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysis.contentQuality.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {analysis.contentQuality.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-600 rounded-full" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Engagement Analysis
                  </span>
                  <Badge variant={getScoreBadgeVariant(analysis.engagement.score)}>
                    {analysis.engagement.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{analysis.engagement.rate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Your Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-muted-foreground">{analysis.engagement.benchmark}%</div>
                      <div className="text-sm text-muted-foreground">Industry Avg</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-4 w-4 ${
                      analysis.engagement.trend === 'up' ? 'text-green-600' : 
                      analysis.engagement.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <span className="text-sm">
                      Trend: {analysis.engagement.trend === 'up' ? 'Increasing' : 
                              analysis.engagement.trend === 'down' ? 'Decreasing' : 'Stable'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                    <ul className="space-y-1">
                      {analysis.engagement.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posting Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Posting Strategy
                  </span>
                  <Badge variant={getScoreBadgeVariant(analysis.posting.score)}>
                    {analysis.posting.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Current Frequency</div>
                    <div className="text-sm text-muted-foreground">{analysis.posting.frequency}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Consistency Score</div>
                    <Progress value={analysis.posting.consistency} className="h-2" />
                    <div className="text-sm text-muted-foreground mt-1">{analysis.posting.consistency}%</div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2">Best Posting Times</div>
                    <div className="flex gap-2">
                      {analysis.posting.bestTimes.map((time, index) => (
                        <Badge key={index} variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hashtag Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hashtag Performance
                </span>
                <Badge variant={getScoreBadgeVariant(analysis.hashtags.score)}>
                  {analysis.hashtags.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Usage Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average per post</span>
                      <span className="font-medium">{analysis.hashtags.usage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Effectiveness</span>
                      <span className="font-medium">{analysis.hashtags.effectiveness}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Top Performing Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.hashtags.topPerforming.map((hashtag, index) => (
                      <Badge key={index} variant="secondary">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="font-medium mb-2">Optimization Tips</h4>
                <ul className="space-y-1">
                  {analysis.hashtags.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Audience Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience Insights
                </span>
                <Badge variant={getScoreBadgeVariant(analysis.audience.score)}>
                  {analysis.audience.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Age Distribution</h4>
                  <div className="space-y-2">
                    {analysis.audience.demographics.ageGroups.map((group, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{group.range}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={group.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Gender Split</h4>
                  <div className="space-y-2">
                    {analysis.audience.demographics.genders.map((gender, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{gender.type}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={gender.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Top Locations</h4>
                  <div className="space-y-2">
                    {analysis.audience.demographics.locations.map((location, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{location.country}</span>
                        <span className="text-sm font-medium">{location.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="font-medium mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {analysis.audience.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          {analysis.competitors && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Competitive Analysis
                </CardTitle>
                <CardDescription>
                  See how you stack up against your competitors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysis.competitors.analysis.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{competitor.name}</h4>
                        <div className="flex gap-4 text-sm">
                          <span>{competitor.followers.toLocaleString()} followers</span>
                          <span>{competitor.engagement}% engagement</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-600 mb-2">Their Strengths</h5>
                          <ul className="space-y-1">
                            {competitor.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <Star className="h-3 w-3" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-blue-600 mb-2">Opportunities for You</h5>
                          <ul className="space-y-1">
                            {competitor.opportunities.map((opportunity, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <Target className="h-3 w-3" />
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <h4 className="font-medium mb-2">Competitive Insights</h4>
                    <ul className="space-y-1">
                      {analysis.competitors.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Info className="h-3 w-3" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Action Plan
              </CardTitle>
              <CardDescription>
                Prioritized steps to improve your profile performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.actionPlan.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={action.priority === 'high' ? 'destructive' : 
                                  action.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {action.priority.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{action.category}</span>
                      </div>
                      <Badge variant="outline">{action.timeline}</Badge>
                    </div>
                    
                    <h4 className="font-medium mb-1">{action.action}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{action.impact}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Effort: {action.effort}</span>
                      <span>•</span>
                      <span>Timeline: {action.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}