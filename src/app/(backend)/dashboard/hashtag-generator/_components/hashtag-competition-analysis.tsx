/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Users,
  BarChart3,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle} from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";

export default function HashtagCompetitionAnalysis() {
  const [searchHashtag, setSearchHashtag] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // API calls
  const { data: competitionData = [], refetch } = api.hashtags.getHashtagCompetitionAnalysis.useQuery({
    platform: selectedPlatform,
  });
  
  const analyzeMutation = api.hashtags.analyzeHashtagCompetition.useMutation({
    onSuccess: () => {
      toast.success(`Analysis complete for ${searchHashtag}`);
      setSearchHashtag("");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze hashtag";
      toast.error(errorMessage);
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "very_hard":
        return "bg-red-100 text-red-800 border-red-200";
      case "unknown":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <Target className="h-4 w-4" />;
      case "hard":
        return <AlertTriangle className="h-4 w-4" />;
      case "very_hard":
        return <XCircle className="h-4 w-4" />;
      case "unknown":
        return <Minus className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "falling":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAnalyzeHashtag = async () => {
    if (!searchHashtag.trim()) {
      toast.error("Please enter a hashtag to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    analyzeMutation.mutate({
      hashtag: searchHashtag,
      platform: selectedPlatform as any,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Analysis Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Hashtag Competition Analysis
          </CardTitle>
          <CardDescription>
            Analyze hashtag competition and discover optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter hashtag (e.g., #marketing)"
                value={searchHashtag}
                onChange={(e) => setSearchHashtag(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAnalyzeHashtag}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competition Analysis Results */}
      <div className="grid grid-cols-1 gap-6">
        {competitionData.map((data, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">{data.hashtag}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {data.platform}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`${getDifficultyColor(data.difficulty ?? "unknown")} flex items-center gap-1`}
                  >
                    {getDifficultyIcon(data.difficulty ?? "unknown")}
                    {(data.difficulty ?? "unknown").replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Last analyzed: {formatDate(data.lastAnalyzed)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{data.competitionScore}</div>
                  <div className="text-sm text-muted-foreground">Competition Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.opportunity}%</div>
                  <div className="text-sm text-muted-foreground">Opportunity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(data.totalPosts ?? 0)}</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(data.recentPosts ?? 0)}</div>
                  <div className="text-sm text-muted-foreground">Recent Posts</div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Engagement</span>
                    <span className="text-sm font-medium">{data.avgEngagement}%</span>
                  </div>
                  <Progress value={parseFloat(data.avgEngagement ?? "0")} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Competition Score</span>
                    <span className="text-sm font-medium">{data.competitionScore}/100</span>
                  </div>
                  <Progress value={parseFloat(data.competitionScore ?? "0")} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Opportunity</span>
                    <span className="text-sm font-medium">{data.opportunity}%</span>
                  </div>
                  <Progress value={parseFloat(data.opportunity ?? "0")} className="h-2" />
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trend Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Direction</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(data.trendDirection ?? "stable")}
                        <span className="text-sm font-medium capitalize">{data.trendDirection ?? "stable"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                      <span className={`text-sm font-medium ${parseFloat(data.growthRate ?? "0") >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(data.growthRate ?? "0") > 0 ? '+' : ''}{data.growthRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Peak Day</span>
                      <span className="text-sm font-medium">{data.peakEngagementDay ?? "Unknown"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Optimal Posting Times
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(data.bestPostingTimes) ? data.bestPostingTimes : []).map((time: number, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {time}:00
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content and Related Hashtags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Top Content Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(data.topContentTypes) ? data.topContentTypes : []).map((type: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Related Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(data.relatedHashtags) ? data.relatedHashtags : []).map((hashtag: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Regions */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Top Regions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(data.topRegions) ? data.topRegions : []).map((region: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Performance Insights */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">💡 Performance Insights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.difficulty === "easy" && (
                    <li>• Low competition - Great opportunity for visibility</li>
                  )}
                  {data.difficulty === "medium" && (
                    <li>• Moderate competition - Good balance of reach and competition</li>
                  )}
                  {data.difficulty === "hard" && (
                    <li>• High competition - Requires quality content to stand out</li>
                  )}
                  {data.difficulty === "very_hard" && (
                    <li>• Very high competition - Consider niche alternatives</li>
                  )}
                  {data.trendDirection === "rising" && (
                    <li>• Trending upward - Great time to use this hashtag</li>
                  )}
                  {parseFloat(data.avgEngagement ?? "0") > 5 && (
                    <li>• High engagement rate - Quality audience interaction</li>
                  )}
                  <li>• Best posting time: {data.peakEngagementDay ?? "Unknown"} at {(Array.isArray(data.bestPostingTimes) && data.bestPostingTimes.length > 0) ? data.bestPostingTimes[0] : 'N/A'}:00</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
