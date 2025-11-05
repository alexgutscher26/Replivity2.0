"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Users,
  Heart,
  Eye,
  Download,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

const testSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  platform: z.enum([
    "instagram",
    "twitter",
    "linkedin",
    "facebook",
    "youtube",
    "tiktok",
  ]),
  testDuration: z.number().min(1).max(30),
  trafficSplit: z.number().min(10).max(90),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "Variant name is required"),
        bio: z.string().min(10, "Bio must be at least 10 characters"),
        profileImage: z.string().optional(),
        username: z.string().min(1, "Username is required"),
        displayName: z.string().min(1, "Display name is required"),
      }),
    )
    .min(2, "At least 2 variants are required"),
});

type TestFormData = z.infer<typeof testSchema>;

interface TestResult {
  id: string;
  name: string;
  platform: string;
  status: "running" | "completed" | "paused";
  startDate: string;
  endDate?: string;
  variants: {
    name: string;
    impressions: number;
    clicks: number;
    followers: number;
    engagement: number;
    conversionRate: number;
    confidence: number;
  }[];
  winner?: string;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    totalFollowers: number;
    avgEngagement: number;
  };
}

const mockTestResults: TestResult[] = [
  {
    id: "test-1",
    name: "Bio Optimization Test",
    platform: "instagram",
    status: "running",
    startDate: "2024-01-15",
    variants: [
      {
        name: "Original Bio",
        impressions: 12500,
        clicks: 890,
        followers: 156,
        engagement: 7.2,
        conversionRate: 12.5,
        confidence: 95,
      },
      {
        name: "Optimized Bio",
        impressions: 12800,
        clicks: 1240,
        followers: 203,
        engagement: 9.7,
        conversionRate: 15.9,
        confidence: 98,
      },
    ],
    winner: "Optimized Bio",
    metrics: {
      totalImpressions: 25300,
      totalClicks: 2130,
      totalFollowers: 359,
      avgEngagement: 8.45,
    },
  },
  {
    id: "test-2",
    name: "Profile Image A/B Test",
    platform: "linkedin",
    status: "completed",
    startDate: "2024-01-10",
    endDate: "2024-01-17",
    variants: [
      {
        name: "Professional Headshot",
        impressions: 8900,
        clicks: 567,
        followers: 89,
        engagement: 6.4,
        conversionRate: 10.0,
        confidence: 92,
      },
      {
        name: "Casual Photo",
        impressions: 9200,
        clicks: 432,
        followers: 67,
        engagement: 4.7,
        conversionRate: 7.3,
        confidence: 88,
      },
    ],
    winner: "Professional Headshot",
    metrics: {
      totalImpressions: 18100,
      totalClicks: 999,
      totalFollowers: 156,
      avgEngagement: 5.55,
    },
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function ABTestingTool() {
  const [activeTab, setActiveTab] = useState("create");
  const [testResults, setTestResults] = useState<TestResult[]>(mockTestResults);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testName: "",
      platform: "instagram",
      testDuration: 7,
      trafficSplit: 50,
      variants: [
        {
          name: "Variant A",
          bio: "",
          username: "",
          displayName: "",
        },
        {
          name: "Variant B",
          bio: "",
          username: "",
          displayName: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const onSubmit = async (data: TestFormData) => {
    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newTest: TestResult = {
      id: `test-${Date.now()}`,
      name: data.testName,
      platform: data.platform,
      status: "running" as const,
      startDate: new Date().toISOString().split("T")[0]!,
      variants: data.variants.map((variant) => ({
        name: variant.name,
        impressions: 0,
        clicks: 0,
        followers: 0,
        engagement: 0,
        conversionRate: 0,
        confidence: 0,
      })),
      metrics: {
        totalImpressions: 0,
        totalClicks: 0,
        totalFollowers: 0,
        avgEngagement: 0,
      },
    };

    setTestResults((prev) => [newTest, ...prev]);
    setIsCreating(false);
    setActiveTab("results");
    toast.success("A/B test created successfully!");
    form.reset();
  };

  const addVariant = () => {
    append({
      name: `Variant ${String.fromCharCode(65 + fields.length)}`,
      bio: "",
      username: "",
      displayName: "",
    });
  };

  const removeVariant = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const toggleTestStatus = (testId: string) => {
    setTestResults((prev) =>
      prev.map((test) => {
        if (test.id === testId) {
          return {
            ...test,
            status:
              test.status === "running"
                ? ("paused" as const)
                : ("running" as const),
          };
        }
        return test;
      }),
    );
  };

  const stopTest = (testId: string) => {
    setTestResults((prev) =>
      prev.map((test) => {
        if (test.id === testId) {
          return {
            ...test,
            status: "completed" as const,
            endDate: new Date().toISOString().split("T")[0],
          };
        }
        return test;
      }),
    );
  };

  const duplicateTest = (test: TestResult) => {
    const newTest: TestResult = {
      ...test,
      id: `test-${Date.now()}`,
      name: `${test.name} (Copy)`,
      status: "paused" as const,
      startDate: new Date().toISOString().split("T")[0]!,
      variants: test.variants.map((variant) => ({
        ...variant,
        impressions: 0,
        clicks: 0,
        followers: 0,
        engagement: 0,
        conversionRate: 0,
        confidence: 0,
      })),
      metrics: {
        totalImpressions: 0,
        totalClicks: 0,
        totalFollowers: 0,
        avgEngagement: 0,
      },
      winner: undefined,
    };

    // Remove endDate for duplicated test since it's a new test
    delete newTest.endDate;

    setTestResults((prev) => [newTest, ...prev]);
    toast.success("Test duplicated successfully!");
  };

  const deleteTest = (testId: string) => {
    setTestResults((prev) => prev.filter((test) => test.id !== testId));
    toast.success("Test deleted successfully!");
  };

  const exportResults = (test: TestResult) => {
    const data = {
      testName: test.name,
      platform: test.platform,
      status: test.status,
      duration:
        test.startDate + (test.endDate ? ` to ${test.endDate}` : " (ongoing)"),
      variants: test.variants,
      metrics: test.metrics,
      winner: test.winner,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ab-test-${test.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Test results exported successfully!");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create A/B Test</CardTitle>
              <CardDescription>
                Set up a new A/B test to compare different profile variations
                and optimize your social media performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="testName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Bio Optimization Test"
                              {...field}
                            />
                          </FormControl>
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
                              <SelectItem value="instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Duration (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="30"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended: 7-14 days for reliable results
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trafficSplit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Traffic Split (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="10"
                              max="90"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage of traffic for Variant A (remaining goes
                            to Variant B)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Test Variants</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        disabled={fields.length >= 4}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Variant
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="relative">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {form.watch(`variants.${index}.name`) ||
                                  `Variant ${String.fromCharCode(65 + index)}`}
                              </CardTitle>
                              {fields.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVariant(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name={`variants.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Variant Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Original Bio"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${index}.username`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="@username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${index}.displayName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Display Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your Name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${index}.bio`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter the bio text for this variant..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${index}.profileImage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Profile Image URL (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com/image.jpg"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating Test..." : "Create A/B Test"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="grid gap-6">
            {testResults.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.name}
                        <Badge
                          variant={
                            test.status === "running"
                              ? "default"
                              : test.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {test.status}
                        </Badge>
                        {test.winner && (
                          <Badge variant="destructive">
                            Winner: {test.winner}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {test.platform.charAt(0).toUpperCase() +
                          test.platform.slice(1)}{" "}
                        • Started: {test.startDate}
                        {test.endDate && ` • Ended: ${test.endDate}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTestStatus(test.id)}
                        disabled={test.status === "completed"}
                      >
                        {test.status === "running" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => stopTest(test.id)}
                        disabled={test.status === "completed"}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTest(test)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResults(test)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Metrics */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {test.metrics.totalImpressions.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                          <Eye className="h-4 w-4" />
                          Impressions
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {test.metrics.totalClicks.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                          <Users className="h-4 w-4" />
                          Clicks
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {test.metrics.totalFollowers.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                          <Heart className="h-4 w-4" />
                          Followers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {test.metrics.avgEngagement.toFixed(1)}%
                        </div>
                        <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          Avg Engagement
                        </div>
                      </div>
                    </div>

                    {/* Variant Comparison */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {test.variants.map((variant, index) => (
                        <Card
                          key={index}
                          className={
                            variant.name === test.winner
                              ? "border-green-500"
                              : ""
                          }
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                              {variant.name}
                              {variant.name === test.winner && (
                                <Badge variant="destructive">Winner</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="font-medium">
                                  {variant.impressions.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                  Impressions
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {variant.clicks.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                  Clicks
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {variant.followers.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                  Followers
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {variant.engagement.toFixed(1)}%
                                </div>
                                <div className="text-muted-foreground">
                                  Engagement
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Conversion Rate</span>
                                <span className="font-medium">
                                  {variant.conversionRate.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={variant.conversionRate}
                                className="h-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Confidence Level</span>
                                <span className="font-medium">
                                  {variant.confidence}%
                                </span>
                              </div>
                              <Progress
                                value={variant.confidence}
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Performance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>
                  Compare key metrics across all test variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testResults[0]?.variants ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="conversionRate"
                      fill="#8884d8"
                      name="Conversion Rate (%)"
                    />
                    <Bar
                      dataKey="engagement"
                      fill="#82ca9d"
                      name="Engagement (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>
                  Track engagement performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { day: "Day 1", variantA: 6.2, variantB: 8.1 },
                      { day: "Day 2", variantA: 6.8, variantB: 8.9 },
                      { day: "Day 3", variantA: 7.1, variantB: 9.2 },
                      { day: "Day 4", variantA: 7.0, variantB: 9.5 },
                      { day: "Day 5", variantA: 7.3, variantB: 9.8 },
                      { day: "Day 6", variantA: 7.2, variantB: 9.7 },
                      { day: "Day 7", variantA: 7.2, variantB: 9.7 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="variantA"
                      stroke="#8884d8"
                      name="Variant A"
                    />
                    <Line
                      type="monotone"
                      dataKey="variantB"
                      stroke="#82ca9d"
                      name="Variant B"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>
                  Distribution of tests across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Instagram", value: 40 },
                        { name: "LinkedIn", value: 30 },
                        { name: "Twitter", value: 20 },
                        { name: "Facebook", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Instagram", value: 40 },
                        { name: "LinkedIn", value: 30 },
                        { name: "Twitter", value: 20 },
                        { name: "Facebook", value: 10 },
                      ].map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Test Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Test Success Rate</CardTitle>
                <CardDescription>
                  Overall performance metrics for all tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests with Statistical Significance</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Improvement</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tests Completed</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-muted-foreground text-sm">
                      Successful
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-muted-foreground text-sm">Running</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-muted-foreground text-sm">
                      Inconclusive
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
