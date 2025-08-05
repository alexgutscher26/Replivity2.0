"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Target,
  Clock,
  Zap,
  Heart,
  Share2,
  MessageSquare,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";

// Import existing components
import FacebookUsage from "../../_components/facebook-usage";
import LinkedinUsage from "../../_components/linkedin-usage";
import TotalUsage from "../../_components/total-usage";
import TwitterUsage from "../../_components/twitter-usage";
import { UsageOverview } from "../../_components/usage-overview";

// Real data components
function UserStatsCard() {
  const { data: userStats } = api.user.getTotalUsers.useQuery();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{userStats?.total?.toLocaleString() ?? 0}</div>
        <p className="text-xs text-muted-foreground">
          {userStats?.percentageChange ? (
            <span className={userStats.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
              {userStats.percentageChange >= 0 ? "+" : ""}{userStats.percentageChange.toFixed(1)}%
            </span>
          ) : (
            <span className="text-muted-foreground">No change</span>
          )} from last month
        </p>
      </CardContent>
    </Card>
  );
}

function ResponseRateCard() {
  const { data: totalUsage } = api.usage.getTotalUsage.useQuery({ isSiteWide: true });
  const { data: totalUsers } = api.user.getTotalUsers.useQuery();
  
  // Calculate response rate as usage per user
  const responseRate = totalUsers?.total && totalUsers.total > 0 
    ? ((totalUsage?.total ?? 0) / totalUsers.total * 100).toFixed(1)
    : "0.0";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Usage per User</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{responseRate}</div>
        <p className="text-xs text-muted-foreground">
          Average generations per user
        </p>
      </CardContent>
    </Card>
  );
}

function ResponseTimeCard() {
  const { data: dailyStats } = api.generations.getDailyStats.useQuery({ days: 7, isSiteWide: true });
  
  // Calculate average daily generations for the week
  const avgDaily = dailyStats && dailyStats.length > 0
    ? (dailyStats.reduce((sum, day) => sum + day.total, 0) / dailyStats.length).toFixed(1)
    : "0.0";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avg Daily Usage</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{avgDaily}</div>
        <p className="text-xs text-muted-foreground">
          Generations per day (7-day avg)
        </p>
      </CardContent>
    </Card>
  );
}

function EngagementMetrics() {
  const { data: facebookStats } = api.generations.getFacebookStats.useQuery({ isSiteWide: true });
  const { data: twitterStats } = api.generations.getTwitterStats.useQuery({ isSiteWide: true });
  const { data: linkedinStats } = api.generations.getLinkedinStats.useQuery({ isSiteWide: true });
  
  const totalEngagements = (facebookStats?.total ?? 0) + (twitterStats?.total ?? 0) + (linkedinStats?.total ?? 0);
  const avgChange = ((facebookStats?.percentageChange ?? 0) + (twitterStats?.percentageChange ?? 0) + (linkedinStats?.percentageChange ?? 0)) / 3;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEngagements.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className={avgChange >= 0 ? "text-green-600" : "text-red-600"}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(1)}%
            </span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facebook Generations</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{facebookStats?.total?.toLocaleString() ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            <span className={facebookStats?.percentageChange && facebookStats.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
              {facebookStats?.percentageChange ? `${facebookStats.percentageChange >= 0 ? "+" : ""}${facebookStats.percentageChange.toFixed(1)}%` : "No change"}
            </span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Twitter Generations</CardTitle>
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{twitterStats?.total?.toLocaleString() ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            <span className={twitterStats?.percentageChange && twitterStats.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
              {twitterStats?.percentageChange ? `${twitterStats.percentageChange >= 0 ? "+" : ""}${twitterStats.percentageChange.toFixed(1)}%` : "No change"}
            </span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">LinkedIn Generations</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{linkedinStats?.total?.toLocaleString() ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            <span className={linkedinStats?.percentageChange && linkedinStats.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
              {linkedinStats?.percentageChange ? `${linkedinStats.percentageChange >= 0 ? "+" : ""}${linkedinStats.percentageChange.toFixed(1)}%` : "No change"}
            </span> from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueMetrics() {
  const { data: totalSales } = api.billings.getTotalSales.useQuery();
  const { data: revenueOverview } = api.billings.getRevenueOverview.useQuery();
  const { data: paidUsers } = api.billings.getPaidUsers.useQuery();
  
  // Calculate MRR from revenue overview (current month)
  const currentMonthRevenue = revenueOverview && revenueOverview.length > 0 
    ? revenueOverview[revenueOverview.length - 1]?.total ?? 0
    : 0;
  
  // Calculate revenue change percentage
  const previousMonthRevenue = revenueOverview && revenueOverview.length > 1
    ? revenueOverview[revenueOverview.length - 2]?.total ?? 0
    : 0;
  
  const revenueChange = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100)
    : 0;
  
  // Calculate ARPU (Average Revenue Per User)
  const arpu = (paidUsers?.total ?? 0) > 0 ? currentMonthRevenue / (paidUsers?.total ?? 1) : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${Number(totalSales?.total ?? 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All-time revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${currentMonthRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            <span className={revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
              {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}%
            </span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
          <Users className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Number(paidUsers?.total ?? 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Active subscribers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ARPU</CardTitle>
          <Target className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${arpu.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Average revenue per user
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TotalUsage isSiteWide />
            <FacebookUsage isSiteWide />
            <TwitterUsage isSiteWide />
            <LinkedinUsage isSiteWide />
          </div>

          {/* Usage Overview Chart */}
          <div className="grid gap-4">
            <UsageOverview isSiteWide />
          </div>

          {/* Additional Overview Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UserStatsCard />
            <ResponseRateCard />
            <ResponseTimeCard />
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <EngagementMetrics />

          {/* Engagement by Platform */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Platform</CardTitle>
              <CardDescription>Platform-specific engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Facebook</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FacebookUsage isSiteWide />
                    <Progress value={75} className="w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                    <span className="text-sm font-medium">Twitter</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <TwitterUsage isSiteWide />
                    <Progress value={65} className="w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <LinkedinUsage isSiteWide />
                    <Progress value={45} className="w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-15%</span> faster than average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+0.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.2%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">-0.1%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>Response times by endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generate Response</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm text-muted-foreground">1.1s</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Authentication</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-20" />
                      <span className="text-sm text-muted-foreground">0.3s</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Retrieval</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-20" />
                      <span className="text-sm text-muted-foreground">0.5s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Gateway</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Services</span>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">Degraded</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,847</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,392</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.7%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Demographics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User distribution by region</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">North America</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20" />
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Europe</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20" />
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asia</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={20} className="w-20" />
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Other</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-20" />
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Platform preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20" />
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={35} className="w-20" />
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4" />
                      <span className="text-sm">Tablet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-20" />
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueMetrics />

          {/* Revenue Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Subscription plan distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Pro</Badge>
                      <span className="text-sm">$29/month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20" />
                      <span className="text-sm text-muted-foreground">$17,388</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Basic</Badge>
                      <span className="text-sm">$9/month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20" />
                      <span className="text-sm text-muted-foreground">$8,694</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Enterprise</Badge>
                      <span className="text-sm">$99/month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={10} className="w-20" />
                      <span className="text-sm text-muted-foreground">$2,891</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Preferred payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Credit Card</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-20" />
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PayPal</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={20} className="w-20" />
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bank Transfer</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-20" />
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+24.5%</div>
                <p className="text-xs text-muted-foreground">
                  Month-over-month growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trending Features</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AI Captions</div>
                <p className="text-xs text-muted-foreground">
                  Most used feature this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Usage Time</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2-4 PM</div>
                <p className="text-xs text-muted-foreground">
                  EST timezone
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption Trends</CardTitle>
                <CardDescription>New feature usage over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Caption Generator</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20" />
                      <Badge variant="default" className="text-xs">Hot</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tweet Generator</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={70} className="w-20" />
                      <Badge variant="secondary" className="text-xs">Growing</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bio Optimizer</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20" />
                      <Badge variant="outline" className="text-xs">Steady</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
                <CardDescription>Usage patterns by time period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Morning (6-12 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={40} className="w-20" />
                      <span className="text-sm text-muted-foreground">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Afternoon (12-6 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={35} className="w-20" />
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Evening (6-12 AM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={20} className="w-20" />
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Night (12-6 AM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-20" />
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Predictions</CardTitle>
              <CardDescription>AI-powered insights and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">User Growth</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected 35% increase in new users next month based on current trends.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">Feature Usage</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI Caption Generator likely to become the most popular feature.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">Revenue</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Projected 25% revenue increase with current subscription trends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}