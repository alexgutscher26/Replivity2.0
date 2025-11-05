"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash } from "lucide-react";
import { toast } from "sonner";

interface HashtagSuggestion {
  hashtag: string;
  category: string;
  popularity: "high" | "medium" | "low";
}

const popularHashtags: HashtagSuggestion[] = [
  // General/Trending
  { hashtag: "#viral", category: "General", popularity: "high" },
  { hashtag: "#trending", category: "General", popularity: "high" },
  { hashtag: "#fyp", category: "General", popularity: "high" },
  { hashtag: "#explore", category: "General", popularity: "medium" },
  { hashtag: "#reels", category: "General", popularity: "high" },

  // Business/Marketing
  { hashtag: "#entrepreneur", category: "Business", popularity: "high" },
  { hashtag: "#marketing", category: "Business", popularity: "high" },
  { hashtag: "#business", category: "Business", popularity: "high" },
  { hashtag: "#startup", category: "Business", popularity: "medium" },
  { hashtag: "#leadership", category: "Business", popularity: "medium" },

  // Technology
  { hashtag: "#tech", category: "Technology", popularity: "high" },
  { hashtag: "#ai", category: "Technology", popularity: "high" },
  { hashtag: "#innovation", category: "Technology", popularity: "medium" },
  { hashtag: "#coding", category: "Technology", popularity: "medium" },
  { hashtag: "#programming", category: "Technology", popularity: "medium" },

  // Lifestyle
  { hashtag: "#lifestyle", category: "Lifestyle", popularity: "high" },
  { hashtag: "#wellness", category: "Lifestyle", popularity: "medium" },
  { hashtag: "#motivation", category: "Lifestyle", popularity: "high" },
  { hashtag: "#inspiration", category: "Lifestyle", popularity: "medium" },
  { hashtag: "#selfcare", category: "Lifestyle", popularity: "medium" },

  // Content Creation
  { hashtag: "#content", category: "Content", popularity: "high" },
  { hashtag: "#creator", category: "Content", popularity: "medium" },
  { hashtag: "#socialmedia", category: "Content", popularity: "medium" },
  { hashtag: "#digitalmarketing", category: "Content", popularity: "medium" },
  { hashtag: "#branding", category: "Content", popularity: "medium" },
];

const getPlatformSpecificHashtags = (platform: string): HashtagSuggestion[] => {
  switch (platform) {
    case "twitter":
      return [
        { hashtag: "#TwitterTips", category: "Platform", popularity: "medium" },
        { hashtag: "#Tweet", category: "Platform", popularity: "high" },
        { hashtag: "#XPlatform", category: "Platform", popularity: "medium" },
      ];
    case "facebook":
      return [
        {
          hashtag: "#FacebookPost",
          category: "Platform",
          popularity: "medium",
        },
        {
          hashtag: "#SocialConnection",
          category: "Platform",
          popularity: "medium",
        },
        {
          hashtag: "#CommunityFirst",
          category: "Platform",
          popularity: "medium",
        },
      ];
    case "linkedin":
      return [
        { hashtag: "#LinkedIn", category: "Platform", popularity: "high" },
        { hashtag: "#Professional", category: "Platform", popularity: "high" },
        { hashtag: "#Career", category: "Platform", popularity: "high" },
        { hashtag: "#Networking", category: "Platform", popularity: "medium" },
      ];
    case "instagram":
      return [
        { hashtag: "#Instagram", category: "Platform", popularity: "high" },
        { hashtag: "#Insta", category: "Platform", popularity: "high" },
        { hashtag: "#IGPost", category: "Platform", popularity: "medium" },
        {
          hashtag: "#PhotoOfTheDay",
          category: "Platform",
          popularity: "medium",
        },
      ];
    default:
      return [];
  }
};

interface HashtagSuggestionsProps {
  platform?: string;
  onHashtagSelect?: (hashtag: string) => void;
}

export default function HashtagSuggestions({
  platform = "twitter",
  onHashtagSelect,
}: HashtagSuggestionsProps) {
  const platformHashtags = getPlatformSpecificHashtags(platform);
  const allSuggestions = [...platformHashtags, ...popularHashtags];

  const copyHashtag = (hashtag: string) => {
    void navigator.clipboard.writeText(hashtag);
    toast.success(`${hashtag} copied to clipboard!`);
  };

  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagSelect) {
      onHashtagSelect(hashtag);
    } else {
      copyHashtag(hashtag);
    }
  };

  const getPriorityColor = (popularity: string) => {
    switch (popularity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const groupedSuggestions = allSuggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category]?.push(suggestion);
      return acc;
    },
    {} as Record<string, HashtagSuggestion[]>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Hashtags
        </CardTitle>
        <CardDescription>
          Popular hashtags for {platform}. Click to copy or use in your content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedSuggestions).map(([category, hashtags]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors ${getPriorityColor(suggestion.popularity)}`}
                    onClick={() => handleHashtagClick(suggestion.hashtag)}
                  >
                    {suggestion.hashtag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4" />
            <span>Click any hashtag to copy it to your clipboard</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
