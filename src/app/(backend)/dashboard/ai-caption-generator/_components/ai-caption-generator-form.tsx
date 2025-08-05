/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Download, Image as ImageIcon, Loader2, Upload, Wand2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const captionGeneratorSchema = z.object({
  image: typeof window !== 'undefined' ? z.instanceof(FileList).optional() : z.any().optional(),
  platform: z.enum(["twitter", "facebook", "linkedin", "instagram"]),
  tone: z.string().min(1, "Please select a tone"),
  context: z.string().optional(),
  hashtags: z.boolean().default(true),
  mentions: z.boolean().default(false),
  variations: z.number().min(1).max(5).default(3),
});

type CaptionGeneratorFormValues = z.infer<typeof captionGeneratorSchema>;

const PLATFORM_OPTIONS = [
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
];

const TONE_OPTIONS = [
  "Professional",
  "Casual",
  "Funny",
  "Inspirational",
  "Educational",
  "Promotional",
  "Storytelling",
  "Question",
];

const platformFormatting = {
  twitter: {
    description: "Twitter/X Post Formatting",
    rules: [
      "Keep under 280 characters total",
      "Use 1-2 line breaks maximum for readability",
      "Place hashtags at the end (2-3 max)",
      "Use emojis sparingly (1-2 max)",
      "Write in a conversational, engaging tone",
      "Include a clear call-to-action if appropriate",
      "Use threading format if content is longer"
    ],
    example: "Just discovered this amazing view! 🌅\n\nSometimes the best moments are unplanned.\n\n#photography #sunrise #nature"
  },
  facebook: {
    description: "Facebook Post Formatting",
    rules: [
      "Use natural paragraph breaks (2-3 paragraphs max)",
      "Start with an engaging hook or question",
      "Include emojis to break up text (3-5 max)",
      "Place hashtags mid-text or at the end (5-10 max)",
      "Encourage engagement with questions",
      "Use storytelling format when appropriate",
      "Keep paragraphs short (2-3 sentences each)"
    ],
    example: "What a perfect morning! ☀️\n\nThere's something magical about watching the world wake up. This view reminded me why I love early morning walks.\n\nWhat's your favorite time of day? 🤔\n\n#morningvibes #nature #photography #peaceful"
  },
  linkedin: {
    description: "LinkedIn Post Formatting",
    rules: [
      "Start with a professional hook or insight",
      "Use clear paragraph structure (3-4 paragraphs max)",
      "Include professional insights or lessons learned",
      "Use minimal emojis (1-2 max, professional ones)",
      "Place hashtags at the end (3-5 relevant industry tags)",
      "Include a call-to-action for professional engagement",
      "Focus on value, learning, or industry relevance"
    ],
    example: "Leadership lesson from an unexpected place.\n\nThis morning's sunrise reminded me of the importance of perspective in business. Sometimes we need to step back and see the bigger picture.\n\nIn my experience, the best solutions often come when we pause and reflect rather than rushing forward.\n\nWhat helps you gain perspective in challenging situations?\n\n#leadership #business #perspective #growth #mindset"
  },
  instagram: {
    description: "Instagram Post Formatting",
    rules: [
      "Use engaging line breaks for visual appeal",
      "Include relevant emojis throughout (5-10 max)",
      "Place hashtags at the end or in first comment (20-30 max)",
      "Use storytelling or behind-the-scenes content",
      "Include location tags when relevant",
      "Encourage engagement with questions or CTAs",
      "Use Instagram-specific language and trends"
    ],
    example: "Golden hour magic ✨\n\n📍 Captured this breathtaking moment during my morning hike\n\n🌅 There's something so peaceful about watching the world wake up\n\n💭 These quiet moments remind me to slow down and appreciate the beauty around us\n\nWhat's your favorite way to start the day? 👇\n\n#goldenhour #sunrise #hiking #nature #peaceful #morningvibes #photography #landscape #mindfulness #gratitude"
  }
};

/**
 * React component for generating AI captions from uploaded images.
 *
 * This component provides a user interface to upload an image, configure various options such as platform, tone,
 * additional context, and the number of caption variations. Once configured, it generates AI captions based on these settings
 * and displays them for the user to copy or download.
 *
 * The main functionalities include:
 * - Handling image uploads and displaying the uploaded image preview.
 * - Configuring various options through form fields.
 * - Generating captions using an AI service when the "Generate Caption" button is clicked.
 * - Displaying generated captions with options to select different variations, copy, or download them.
 *
 * Dependencies: react, next/image, shadcn-ui components for forms and select inputs, zod for form validation,
 * axios for making API requests to the AI service.
 *
 */
export function AiCaptionGeneratorForm() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState<number>(0);

  // Fetch user's brand voice settings
  const { data: accountSettings } = api.settings.account.useQuery();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.serverData?.fileUrl && typeof res[0].serverData.fileUrl === 'string') {
        setUploadedImage(res[0].serverData.fileUrl);
        toast.success("Image uploaded successfully!");
      }
    },
    onUploadError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<CaptionGeneratorFormValues>({
    resolver: zodResolver(captionGeneratorSchema),
    defaultValues: {
      platform: "twitter",
      tone: "Professional",
      context: "",
      hashtags: true,
      mentions: false,
      variations: 3,
    },
  });

  const generateCaption = api.generations.generate.useMutation({
    onSuccess: (data) => {
      // Split the result into multiple captions
      const captions = data.text
        .split('---VARIATION---')
        .map(caption => caption.trim())
        .filter(caption => caption.length > 0);

      setGeneratedCaptions(captions.length > 0 ? captions : [data.text]);
      setIsGenerating(false);
      toast.success("Caption generated successfully!");
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error(error.message);
    },
  });

  /**
   * Handles the uploading of image files.
   *
   * This function checks if the provided file list is valid, validates the file type to ensure it's an image,
   * and verifies that the file size does not exceed 4MB. If any validation fails, it displays an error message.
   * Otherwise, it starts the upload process for the selected file.
   *
   * @param files - A FileList object containing the files to be uploaded, or null/undefined if no files are selected.
   */
  const handleImageUpload = async (files: FileList | null | undefined) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 4MB.");
      return;
    }

    await startUpload([file]);
  };

  /**
   * Handles form submission for generating image captions.
   *
   * This function processes user input, constructs a detailed prompt based on various settings and preferences,
   * and triggers a mutation to generate caption variations using the constructed prompt.
   *
   * @param data - An object containing form values such as context, hashtags, mentions, platform, tone, and number of variations.
   */
  const onSubmit = async (data: CaptionGeneratorFormValues) => {
    if (!uploadedImage) {
      toast.error("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    setGeneratedCaptions([]);
    setSelectedCaptionIndex(0);

    // Build brand voice context from user settings
    let brandVoiceContext = "";
    if (accountSettings && !accountSettings.customPrompt) {
      const brandParts = [];
      
      if (accountSettings.brandName) {
        brandParts.push(`Brand: ${accountSettings.brandName}`);
      }
      
      if (accountSettings.brandPersonality) {
        brandParts.push(`Brand Personality: ${accountSettings.brandPersonality}`);
      }
      
      if (accountSettings.brandTone && accountSettings.brandTone !== "professional") {
        if (accountSettings.brandTone === "custom" && accountSettings.customTone) {
          brandParts.push(`Brand Tone: ${accountSettings.customTone}`);
        } else {
          brandParts.push(`Brand Tone: ${accountSettings.brandTone}`);
        }
      }
      
      if (accountSettings.brandValues) {
        brandParts.push(`Brand Values: ${accountSettings.brandValues}`);
      }
      
      if (accountSettings.targetAudience) {
        brandParts.push(`Target Audience: ${accountSettings.targetAudience}`);
      }
      
      if (accountSettings.brandKeywords) {
        brandParts.push(`Include these keywords naturally: ${accountSettings.brandKeywords}`);
      }
      
      if (accountSettings.avoidKeywords) {
        brandParts.push(`Avoid these keywords: ${accountSettings.avoidKeywords}`);
      }
      
      if (brandParts.length > 0) {
        brandVoiceContext = `\n\nBRAND VOICE GUIDELINES:\n${brandParts.join('\n')}`;
      }
    }

    // Create a prompt for the AI based on the image and user preferences
    const contextText = data.context ? ` Additional context: ${data.context}` : "";
    const hashtagText = data.hashtags ? " Include relevant hashtags." : " Do not include hashtags.";
    const mentionText = data.mentions ? " Include relevant mentions if appropriate." : " Do not include mentions.";
    
    // Get platform-specific formatting rules
    const selectedPlatform = platformFormatting[data.platform];
    const formattingRules = selectedPlatform.rules.join('\n• ');
    
    // Use custom prompt if available, otherwise use brand voice + standard prompt
    let basePrompt;
    if (accountSettings?.customPrompt) {
      basePrompt = `${accountSettings.customPrompt}\n\nImage context: Generate a caption for this uploaded image for ${data.platform}.${contextText}${hashtagText}${mentionText}\n\nPLATFORM-SPECIFIC FORMATTING REQUIREMENTS:\n• ${formattingRules}\n\nExample format:\n${selectedPlatform.example}`;
    } else {
      basePrompt = `Generate an engaging ${data.tone.toLowerCase()} caption for this image that will be posted on ${data.platform}. The image is uploaded and available for analysis.${contextText}${hashtagText}${mentionText}${brandVoiceContext}\n\n${selectedPlatform.description.toUpperCase()} REQUIREMENTS:\n• ${formattingRules}\n\nExample format for reference:\n${selectedPlatform.example}\n\nMake the caption platform-appropriate, engaging, and properly formatted with natural line breaks that make it look like a real social media post. Follow the brand voice guidelines above to ensure consistency with the brand's personality and values.`;
    }

    const finalPrompt = `${basePrompt}\n\nPlease generate exactly ${data.variations} different caption variations. Each variation should be unique and creative while maintaining the same tone and requirements. Separate each variation with "---VARIATION---" on a new line.`;

    generateCaption.mutate({
      source: data.platform,
      post: finalPrompt,
      tone: data.tone,
      type: "status",
      link: uploadedImage,
    });
  };

  /**
   * Copies the currently selected caption to the clipboard.
   *
   * This function retrieves the caption at the `selectedCaptionIndex` from the `generatedCaptions` array.
   * If the caption exists, it attempts to copy it to the clipboard using the Clipboard API.
   * Success or failure is indicated by a toast notification.
   */
  const copyToClipboard = async () => {
    const currentCaption = generatedCaptions[selectedCaptionIndex];
    if (!currentCaption) return;
    
    try {
      await navigator.clipboard.writeText(currentCaption);
      toast.success("Caption copied to clipboard.");
    } catch {
      toast.error("Failed to copy caption to clipboard.");
    }
  };

  /**
   * Downloads the currently selected caption as a text file.
   */
  const downloadCaption = () => {
    const currentCaption = generatedCaptions[selectedCaptionIndex];
    if (!currentCaption) return;
    
    const blob = new Blob([currentCaption], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caption.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload and Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload & Configure
          </CardTitle>
          <CardDescription>
            Upload an image and configure your caption preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={uploadedImage}
                      alt="Uploaded image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedImage(null);
                      setGeneratedCaptions([]);
                      setSelectedCaptionIndex(0);
                    }}
                  >
                    Upload Different Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, GIF up to 4MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => {
                  const selectedPlatform = platformFormatting[field.value];
                  return (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPlatform && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                          <p className="text-sm font-medium text-foreground mb-2">
                            {selectedPlatform.description}
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p className="font-medium">Formatting Guidelines:</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-2">
                              {selectedPlatform.rules.slice(0, 3).map((rule, index) => (
                                <li key={index}>{rule}</li>
                              ))}
                              {selectedPlatform.rules.length > 3 && (
                                <li className="text-muted-foreground/70">+ {selectedPlatform.rules.length - 3} more guidelines</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                        {TONE_OPTIONS.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone}
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
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any additional context about the image or desired caption style..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help the AI understand what you want to emphasize in the caption.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Hashtags</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mentions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include Mentions</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="variations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption Variations</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of variations" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 variation</SelectItem>
                        <SelectItem value="2">2 variations</SelectItem>
                        <SelectItem value="3">3 variations</SelectItem>
                        <SelectItem value="4">4 variations</SelectItem>
                        <SelectItem value="5">5 variations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how many different caption variations to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!uploadedImage || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Caption...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Caption
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Generated Caption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generated Caption
          </CardTitle>
          <CardDescription>
            Your AI-generated caption will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedCaptions.length > 0 ? (
            <div className="space-y-4">
              {generatedCaptions.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {generatedCaptions.map((_, index) => (
                    <Button
                      key={index}
                      variant={selectedCaptionIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCaptionIndex(index)}
                    >
                      Variation {index + 1}
                    </Button>
                  ))}
                </div>
              )}
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{generatedCaptions[selectedCaptionIndex]}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadCaption} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Upload an image and click "Generate Caption" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}