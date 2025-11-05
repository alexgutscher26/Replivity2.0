"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Hash, TrendingUp } from "lucide-react";

export default function HashtagUsage() {
  const { data: hashtagStats, isLoading } =
    api.generations.getHashtagStats.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Hashtag Generation
          </CardTitle>
          <Hash className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
          <p className="text-muted-foreground text-xs">
            Calculating hashtag usage...
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = hashtagStats?.total ?? 0;
  const percentageChange = hashtagStats?.percentageChange ?? 0;
  const isPositive = percentageChange >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Hashtag Generation
        </CardTitle>
        <Hash className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{total.toLocaleString()}</div>
        <p className="text-muted-foreground text-xs">
          <span
            className={`inline-flex items-center gap-1 ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            {isPositive ? "+" : ""}
            {percentageChange.toFixed(1)}%
          </span>{" "}
          from last month
        </p>
      </CardContent>
    </Card>
  );
}
