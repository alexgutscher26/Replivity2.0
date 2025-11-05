"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Eye,
  Heart,
  Share,
  Bookmark,
  MousePointer,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";

interface PerformanceMetrics {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  saves: number;
  engagementRate: number;
  clickThroughRate: number;
  trendScore: number;
}

interface HashtagPerformance {
  hashtag: string;
  platform: string;
  metrics: PerformanceMetrics;
  category: string;
  competitionLevel: string;
  updatedAt: string;
}

// Mock data for demonstration
const mockHashtagData: HashtagPerformance[] = [
  {
    hashtag: "#socialmedia",
    platform: "twitter",
    metrics: {
      impressions: 15420,
      engagements: 2341,
      clicks: 512,
      shares: 89,
      saves: 34,
      engagementRate: 15.2,
      clickThroughRate: 3.3,
      trendScore: 8.7,
    },
    category: "Marketing",
    competitionLevel: "High",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    hashtag: "#AItools",
    platform: "linkedin",
    metrics: {
      impressions: 8950,
      engagements: 1847,
      clicks: 398,
      shares: 156,
      saves: 67,
      engagementRate: 20.6,
      clickThroughRate: 4.4,
      trendScore: 9.1,
    },
    category: "Technology",
    competitionLevel: "Medium",
    updatedAt: "2024-01-15T09:15:00Z",
  },
  {
    hashtag: "#contentcreator",
    platform: "instagram",
    metrics: {
      impressions: 23140,
      engagements: 4628,
      clicks: 1156,
      shares: 234,
      saves: 445,
      engagementRate: 20.0,
      clickThroughRate: 5.0,
      trendScore: 7.9,
    },
    category: "Content",
    competitionLevel: "High",
    updatedAt: "2024-01-15T08:45:00Z",
  },
];

export default function HashtagPerformanceAnalytics() {
  const [selectedPlatform] = useState("all");

  // API calls
  const { data: performanceData = [], isLoading } =
    api.hashtags.getHashtagPerformance.useQuery({
      platform: selectedPlatform,
    });

  // Transform API data to match component interface
  const transformedData: HashtagPerformance[] = performanceData.map((item) => ({
    hashtag: item.hashtag,
    platform: item.platform,
    metrics: {
      impressions: item.impressions ?? 0,
      engagements: item.engagements ?? 0,
      clicks: item.clicks ?? 0,
      shares: item.shares ?? 0,
      saves: item.saves ?? 0,
      engagementRate: parseFloat(item.engagementRate ?? "0"),
      clickThroughRate: parseFloat(item.clickThroughRate ?? "0"),
      trendScore: parseFloat(item.trendScore ?? "0"),
    },
    category: item.category ?? "General",
    competitionLevel: item.competitionLevel ?? "Medium",
    updatedAt: item.updatedAt?.toISOString() || new Date().toISOString(),
  }));

  // Fallback to mock data if no real data
  const displayData =
    transformedData.length > 0 ? transformedData : mockHashtagData;

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "impressions":
        return <Eye className="h-4 w-4" />;
      case "engagements":
        return <Heart className="h-4 w-4" />;
      case "clicks":
        return <MousePointer className="h-4 w-4" />;
      case "shares":
        return <Share className="h-4 w-4" />;
      case "saves":
        return <Bookmark className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayData.map((item, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {item.hashtag}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {item.platform}
                </Badge>
                <Badge
                  variant="secondary"
                  className={getCompetitionColor(item.competitionLevel)}
                >
                  {item.competitionLevel}
                </Badge>
              </div>
            </div>
            <CardDescription>
              {item.category} • Updated {formatDate(item.updatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {getMetricIcon("impressions")}
                <div>
                  <p className="text-muted-foreground text-sm">Impressions</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(item.metrics.impressions)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getMetricIcon("engagements")}
                <div>
                  <p className="text-muted-foreground text-sm">Engagements</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(item.metrics.engagements)}
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Engagement Rate
                </span>
                <span className="text-sm font-medium">
                  {item.metrics.engagementRate}%
                </span>
              </div>
              <Progress value={item.metrics.engagementRate} className="h-2" />
            </div>

            {/* Click-Through Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Click-Through Rate
                </span>
                <span className="text-sm font-medium">
                  {item.metrics.clickThroughRate}%
                </span>
              </div>
              <Progress value={item.metrics.clickThroughRate} className="h-2" />
            </div>

            {/* Trend Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Trend Score
                </span>
                <span className="text-sm font-medium">
                  {item.metrics.trendScore}/10
                </span>
              </div>
              <Progress value={item.metrics.trendScore * 10} className="h-2" />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-2 border-t pt-2">
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Clicks</p>
                <p className="text-sm font-medium">
                  {formatNumber(item.metrics.clicks)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Shares</p>
                <p className="text-sm font-medium">
                  {formatNumber(item.metrics.shares)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-xs">Saves</p>
                <p className="text-sm font-medium">
                  {formatNumber(item.metrics.saves)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
