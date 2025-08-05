/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Eye,
  Download,
  Copy,
  ExternalLink,
  Palette,
  Layout,
  BarChart3,
  Settings,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  Github,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";

// Schema for form validation
const linkInBioSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be 50 characters or less"),
  description: z.string().max(200, "Description must be 200 characters or less"),
  profileImage: z.string().url().optional().or(z.literal("")),
  theme: z.enum(["minimal", "gradient", "neon", "classic", "modern", "dark"]),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonStyle: z.enum(["rounded", "square", "pill"]),
  links: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, "Link title is required"),
      url: z.string().url("Please enter a valid URL"),
      description: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().default(true),
      priority: z.number().default(0),
    })
  ),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    github: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
  }),
  customization: z.object({
    showProfileImage: z.boolean().default(true),
    showDescription: z.boolean().default(true),
    showSocialLinks: z.boolean().default(true),
    enableAnalytics: z.boolean().default(true),
    customCSS: z.string().optional(),
  }),
});

type LinkInBioFormValues = z.infer<typeof linkInBioSchema>;

interface LinkInBioPreview {
  url: string;
  qrCode: string;
  analytics: {
    totalClicks: number;
    uniqueVisitors: number;
    topLinks: { title: string; clicks: number }[];
    recentActivity: { date: string; clicks: number }[];
  };
}

// Predefined themes
const themes = {
  minimal: {
    name: "Minimal",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "#f3f4f6",
    buttonTextColor: "#374151",
  },
  gradient: {
    name: "Gradient",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    buttonColor: "rgba(255, 255, 255, 0.2)",
    buttonTextColor: "#ffffff",
  },
  neon: {
    name: "Neon",
    backgroundColor: "#0a0a0a",
    textColor: "#00ff88",
    buttonColor: "#1a1a1a",
    buttonTextColor: "#00ff88",
  },
  classic: {
    name: "Classic",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    buttonColor: "#3b82f6",
    buttonTextColor: "#ffffff",
  },
  modern: {
    name: "Modern",
    backgroundColor: "#1f2937",
    textColor: "#f9fafb",
    buttonColor: "#10b981",
    buttonTextColor: "#ffffff",
  },
  dark: {
    name: "Dark",
    backgroundColor: "#111827",
    textColor: "#e5e7eb",
    buttonColor: "#374151",
    buttonTextColor: "#f3f4f6",
  },
};

// Popular link templates
const linkTemplates = [
  { title: "My Website", url: "https://yourwebsite.com", icon: "globe" },
  { title: "Shop My Products", url: "https://yourstore.com", icon: "shopping-bag" },
  { title: "Book a Call", url: "https://calendly.com/yourusername", icon: "calendar" },
  { title: "My Portfolio", url: "https://yourportfolio.com", icon: "briefcase" },
  { title: "Latest Blog Post", url: "https://yourblog.com/latest", icon: "file-text" },
  { title: "Subscribe to Newsletter", url: "https://yoursubscription.com", icon: "mail" },
  { title: "Download My App", url: "https://yourapp.com", icon: "smartphone" },
  { title: "Join My Community", url: "https://discord.gg/yourcommunity", icon: "users" },
];

export function LinkInBioCreator() {
  const { user } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<LinkInBioPreview | null>(null);
  const [activeTab, setActiveTab] = useState<"design" | "links" | "social" | "settings" | "preview">("design");

  const form = useForm<LinkInBioFormValues>({
    resolver: zodResolver(linkInBioSchema),
    defaultValues: {
      title: user?.name ?? "Your Name",
      description: "Welcome to my link-in-bio page!",
      profileImage: "",
      theme: "minimal",
      backgroundColor: themes.minimal.backgroundColor,
      textColor: themes.minimal.textColor,
      buttonStyle: "rounded",
      links: [
        {
          id: "1",
          title: "My Website",
          url: "https://example.com",
          description: "Check out my main website",
          icon: "globe",
          isActive: true,
          priority: 0,
        },
      ],
      socialLinks: {
        instagram: "",
        twitter: "",
        linkedin: "",
        facebook: "",
        youtube: "",
        github: "",
        email: "",
        phone: "",
        website: "",
      },
      customization: {
        showProfileImage: true,
        showDescription: true,
        showSocialLinks: true,
        enableAnalytics: true,
        customCSS: "",
      },
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const addLink = () => {
    appendLink({
      id: Date.now().toString(),
      title: "",
      url: "",
      description: "",
      icon: "link",
      isActive: true,
      priority: linkFields.length,
    });
  };

  const addTemplateLink = (template: typeof linkTemplates[0]) => {
    appendLink({
      id: Date.now().toString(),
      title: template.title,
      url: template.url,
      description: "",
      icon: template.icon,
      isActive: true,
      priority: linkFields.length,
    });
  };

  const generatePreview = async (data: LinkInBioFormValues) => {
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock preview data
      const mockPreview: LinkInBioPreview = {
        url: `https://linkbio.app/${user?.name?.toLowerCase().replace(/\s+/g, '') ?? 'username'}`,
        qrCode: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=",
        analytics: {
          totalClicks: 1247,
          uniqueVisitors: 892,
          topLinks: [
            { title: data.links[0]?.title ?? "Link 1", clicks: 456 },
            { title: data.links[1]?.title ?? "Link 2", clicks: 321 },
            { title: data.links[2]?.title ?? "Link 3", clicks: 189 },
          ],
          recentActivity: [
            { date: "2024-01-15", clicks: 45 },
            { date: "2024-01-14", clicks: 38 },
            { date: "2024-01-13", clicks: 52 },
            { date: "2024-01-12", clicks: 41 },
            { date: "2024-01-11", clicks: 33 },
          ],
        },
      };
      
      setPreview(mockPreview);
      setActiveTab("preview");
      
      toast.success("Link-in-bio page generated!", {
        description: "Your page is ready to share with the world.",
      });
    } catch (error) {
      toast.error("Generation failed", {
        description: "Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const exportPage = () => {
    const data = form.getValues();
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}-linkinbio.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Page exported successfully!");
  };

  const onSubmit = async (data: LinkInBioFormValues) => {
    await generatePreview(data);
  };

  const selectedTheme = themes[form.watch("theme")];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { id: "design", label: "Design", icon: Palette },
          { id: "links", label: "Links", icon: LinkIcon },
          { id: "social", label: "Social", icon: Globe },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "preview", label: "Preview", icon: Eye },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Design Tab */}
          {activeTab === "design" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Set up your profile information and basic details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name or Brand" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell people what you do or what they can find here..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/200 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            Add a URL to your profile picture
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      Theme & Style
                    </CardTitle>
                    <CardDescription>
                      Choose a theme and customize the appearance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(themes).map(([key, theme]) => (
                                <SelectItem key={key} value={key}>
                                  {theme.name}
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
                      name="buttonStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select button style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="rounded">Rounded</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="pill">Pill</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview */}
              <div className="lg:sticky lg:top-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full max-w-sm mx-auto rounded-lg p-6 min-h-[400px]"
                      style={{
                        background: selectedTheme.backgroundColor,
                        color: selectedTheme.textColor,
                      }}
                    >
                      {form.watch("customization.showProfileImage") && form.watch("profileImage") && (
                        <div className="flex justify-center mb-4">
                          <img
                            src={form.watch("profileImage")}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold mb-2">{form.watch("title")}</h2>
                        {form.watch("customization.showDescription") && form.watch("description") && (
                          <p className="text-sm opacity-80">{form.watch("description")}</p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {form.watch("links").filter(link => link.isActive).slice(0, 3).map((link, index) => (
                          <div
                            key={index}
                            className={`w-full p-3 text-center transition-all duration-200 hover:scale-105 ${
                              form.watch("buttonStyle") === "rounded" ? "rounded-lg" :
                              form.watch("buttonStyle") === "pill" ? "rounded-full" : "rounded-none"
                            }`}
                            style={{
                              backgroundColor: selectedTheme.buttonColor,
                              color: selectedTheme.buttonTextColor,
                            }}
                          >
                            {link.title || "Link Title"}
                          </div>
                        ))}
                      </div>
                      
                      {form.watch("customization.showSocialLinks") && (
                        <div className="flex justify-center gap-3 mt-6">
                          {["instagram", "twitter", "linkedin"].map((platform) => (
                            <div
                              key={platform}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: selectedTheme.buttonColor }}
                            >
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedTheme.buttonTextColor }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === "links" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Manage Links
                      </CardTitle>
                      <CardDescription>
                        Add and organize your important links.
                      </CardDescription>
                    </div>
                    <Button onClick={addLink} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quick Templates */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Quick Add Templates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {linkTemplates.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addTemplateLink(template)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {template.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {/* Links List */}
                  <div className="space-y-4">
                    {linkFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`links.${index}.title`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Link Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="My Awesome Link" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`links.${index}.url`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`links.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Brief description..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`links.${index}.isActive`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm">Active</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLink(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    
                    {linkFields.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No links added yet. Click "Add Link" to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Connect your social media profiles and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter/X
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/@username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          GitHub
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialLinks.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Website
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Display Settings
                  </CardTitle>
                  <CardDescription>
                    Control what elements are shown on your page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customization.showProfileImage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Profile Image</FormLabel>
                          <FormDescription>
                            Display your profile picture on the page
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
                    name="customization.showDescription"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Description</FormLabel>
                          <FormDescription>
                            Display your bio description
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
                    name="customization.showSocialLinks"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Social Links</FormLabel>
                          <FormDescription>
                            Display social media icons
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
                    name="customization.enableAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Enable Analytics</FormLabel>
                          <FormDescription>
                            Track clicks and visitor data
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
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Advanced Customization
                  </CardTitle>
                  <CardDescription>
                    Add custom CSS for advanced styling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="customization.customCSS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom CSS</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="/* Add your custom CSS here */\n.custom-button {\n  border-radius: 20px;\n  box-shadow: 0 4px 8px rgba(0,0,0,0.1);\n}"
                            className="font-mono text-sm"
                            rows={10}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Advanced users can add custom CSS to further customize the appearance.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              {preview ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Generated Page Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5" />
                          Your Link-in-Bio Page
                        </CardTitle>
                        <CardDescription>
                          Your page is ready! Share this link with your audience.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 font-mono text-sm">{preview.url}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void copyToClipboard(preview.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={exportPage} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export Configuration
                          </Button>
                          <Button onClick={() => window.open(preview.url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Page
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Analytics Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Analytics Preview
                        </CardTitle>
                        <CardDescription>
                          Track how your links are performing.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{preview.analytics.totalClicks}</div>
                            <div className="text-sm text-muted-foreground">Total Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{preview.analytics.uniqueVisitors}</div>
                            <div className="text-sm text-muted-foreground">Unique Visitors</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{preview.analytics.topLinks.length}</div>
                            <div className="text-sm text-muted-foreground">Active Links</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">98%</div>
                            <div className="text-sm text-muted-foreground">Uptime</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Top Performing Links</h4>
                          <div className="space-y-2">
                            {preview.analytics.topLinks.map((link, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm">{link.title}</span>
                                <Badge variant="secondary">{link.clicks} clicks</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* QR Code */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center">QR Code</CardTitle>
                        <CardDescription className="text-center">
                          Share your page easily with a QR code.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="inline-block p-4 bg-white rounded-lg">
                          <img
                            src={preview.qrCode}
                            alt="QR Code"
                            className="w-32 h-32 mx-auto"
                          />
                        </div>
                        <Button
                          className="mt-4 w-full"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = preview.qrCode;
                            link.download = 'qr-code.svg';
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download QR Code
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate your link-in-bio page to see the preview and analytics.
                    </p>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isGenerating}>
                      {isGenerating ? "Generating..." : "Generate Page"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Generate Button */}
          {activeTab !== "preview" && (
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Link-in-Bio Page
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}