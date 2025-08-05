/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Download, RefreshCw, Twitter, Wand2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const tweetGeneratorSchema = z.object({
	topic: z.string().min(1, "Topic is required").max(200, "Topic must be less than 200 characters"),
	tone: z.enum(["professional", "casual", "humorous", "inspirational", "educational", "conversational"]),
	context: z.string().max(500, "Context must be less than 500 characters").optional(),
	includeEmojis: z.boolean().default(false),
	includeHashtags: z.boolean().default(false),
	variations: z.number().min(1).max(5).default(3),
});

type TweetGeneratorFormValues = z.infer<typeof tweetGeneratorSchema>;

const TONE_OPTIONS = [
	{ value: "professional", label: "Professional" },
	{ value: "casual", label: "Casual" },
	{ value: "humorous", label: "Humorous" },
	{ value: "inspirational", label: "Inspirational" },
	{ value: "educational", label: "Educational" },
	{ value: "conversational", label: "Conversational" },
];



/**
 * React component for generating human-like tweets using AI.
 *
 * This component provides a user interface to create authentic Twitter content that passes AI detection.
 * Users can specify topic, tone, context, and choose whether to include emojis and hashtags.
 * The component generates multiple tweet variations with natural line breaks and human-like writing patterns.
 *
 * Key features:
 * - Human-like tweet generation that bypasses AI detection
 * - Optional emoji and hashtag integration
 * - Multiple tone options for different content styles
 * - Natural line breaks and authentic language patterns
 * - Copy and download functionality for generated tweets
 * - Integration with user's brand voice settings
 */
export function TweetGeneratorForm() {
	const [generatedTweets, setGeneratedTweets] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedTweetIndex, setSelectedTweetIndex] = useState<number>(0);

	const form = useForm<TweetGeneratorFormValues>({
		resolver: zodResolver(tweetGeneratorSchema),
		defaultValues: {
			topic: "",
			tone: "conversational",
			context: "",
			includeEmojis: false,
			includeHashtags: false,
			variations: 3,
		},
	});

	// Fetch user account settings for brand voice
	const { data: accountSettings } = api.settings.account.useQuery();

	// Generate tweet mutation
  const generateTweet = api.generations.generate.useMutation({
		onSuccess: (data) => {
				if (data?.text) {
					// Split variations if multiple tweets are generated
					const variations = data.text.split('---VARIATION---').map((tweet: string) => tweet.trim()).filter(Boolean);
					setGeneratedTweets(variations);
					setSelectedTweetIndex(0);
				}
				setIsGenerating(false);
				toast.success("Tweet generated successfully!");
			},
		onError: (error) => {
				setIsGenerating(false);
				toast.error(error.message ?? "Failed to generate tweet. Please try again.");
			},
	});

	/**
	 * Handles form submission and generates tweets based on user input.
	 * Constructs a detailed prompt with human-like writing instructions,
	 * brand voice guidelines, and specific formatting requirements.
	 */
	const onSubmit = async (data: TweetGeneratorFormValues) => {
		setIsGenerating(true);
		setGeneratedTweets([]);
		setSelectedTweetIndex(0);

		// Build context text
		let contextText = "";
		if (data.context?.trim()) {
			contextText = `\n\nAdditional Context: ${data.context}`;
		}

		// Build emoji instruction
		const emojiText = data.includeEmojis 
			? "\n\nEMOJI USAGE: Include 1-3 relevant emojis naturally integrated into the text. Use emojis that enhance the message without overwhelming it."
			: "\n\nEMOJI USAGE: Do NOT include any emojis in the tweet.";

		// Build hashtag instruction
		const hashtagText = data.includeHashtags 
			? "\n\nHASHTAG USAGE: Include 1-3 relevant hashtags at the end of the tweet. Choose hashtags that are popular but not overly generic."
			: "\n\nHASHTAG USAGE: Do NOT include any hashtags in the tweet.";

		// Build brand voice context from user settings
		let brandVoiceContext = "";
		if (accountSettings) {
			const brandParts: string[] = [];
			
			if (accountSettings.brandPersonality) {
				brandParts.push(`Brand Personality: ${accountSettings.brandPersonality}`);
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

		// Construct the human-like writing prompt
		let basePrompt = "";
		
		if (accountSettings?.customPrompt) {
			basePrompt = `${accountSettings.customPrompt}\n\nTopic: Create a ${data.tone.toLowerCase()} tweet about: ${data.topic}${contextText}${emojiText}${hashtagText}`;
		} else {
			basePrompt = `Create an authentic, human-like tweet about: ${data.topic}

TONE: ${data.tone.toUpperCase()}

HUMAN-LIKE WRITING REQUIREMENTS:
• Write naturally with authentic voice and personality
• Use line breaks strategically for readability and impact
• Vary sentence structure (mix short punchy lines with longer thoughts)
• Include conversational elements that encourage engagement
• Avoid overly polished or corporate language
• Use contractions and informal expressions where appropriate
• Show genuine personality and relatability
• Include thoughtful pauses with line breaks
• Make it feel like a real person wrote it, not an AI

TWITTER-SPECIFIC FORMATTING:
• Keep under 280 characters total
• Use line breaks to create visual appeal and readability
• Make each line impactful and engaging
• Ensure the tweet flows naturally when read aloud
• Include authentic engagement hooks (questions, observations, insights)

AUTHENTICITY GUIDELINES:
• Write from a genuine perspective
• Include specific details rather than generic statements
• Use language that feels natural and unforced
• Show vulnerability or admit uncertainty when appropriate
• Reference real experiences or observations
• Avoid buzzwords and marketing speak${contextText}${emojiText}${hashtagText}${brandVoiceContext}`;
		}

		const finalPrompt = `${basePrompt}\n\nPlease generate exactly ${data.variations} different tweet variations. Each variation should be unique, authentic, and human-like while maintaining the same tone and requirements. Use natural line breaks in each tweet for better readability. Separate each variation with "---VARIATION---" on a new line.`;

		generateTweet.mutate({
			source: "twitter",
			type: "status",
			post: finalPrompt,
			tone: data.tone,
			author: "Tweet Generator",
		});
	};

	/**
	 * Copies the currently selected tweet to clipboard.
	 */
	const copyToClipboard = async () => {
		const currentTweet = generatedTweets[selectedTweetIndex];
		if (!currentTweet) return;
		
		try {
			await navigator.clipboard.writeText(currentTweet);
			toast.success("Tweet copied to clipboard!");
		} catch {
			toast.error("Failed to copy tweet to clipboard.");
		}
	};

	/**
	 * Downloads the currently selected tweet as a text file.
	 */
	const downloadTweet = () => {
		const currentTweet = generatedTweets[selectedTweetIndex];
		if (!currentTweet) return;
		
		const blob = new Blob([currentTweet], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `tweet-${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("Tweet downloaded successfully!");
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Tweet Generator Form */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Twitter className="h-5 w-5" />
						Tweet Generator
					</CardTitle>
					<CardDescription>
						Generate authentic, human-like tweets that pass AI detection. Customize with optional emojis and hashtags.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{/* Topic Field */}
							<FormField
								control={form.control}
								name="topic"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tweet Topic *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What would you like to tweet about? (e.g., 'productivity tips for remote workers', 'my morning coffee routine', 'thoughts on the latest tech trends')"
												rows={3}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Describe the main topic or theme for your tweet. Be specific for better results.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Tone Selection */}
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
													<SelectItem key={tone.value} value={tone.value}>
														{tone.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>
											Choose the tone that best fits your message and audience.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Additional Context */}
							<FormField
								control={form.control}
								name="context"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Additional Context (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Add any specific details, personal experiences, or context that should be included in the tweet..."
												rows={3}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Provide additional context, personal experiences, or specific details to make the tweet more authentic.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Options */}
							<div className="space-y-4">
								<FormLabel>Options</FormLabel>
								
								{/* Include Emojis */}
								<FormField
									control={form.control}
									name="includeEmojis"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-sm font-normal">
													Include Emojis
												</FormLabel>
												<FormDescription className="text-xs">
													Add relevant emojis to make the tweet more engaging
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>

								{/* Include Hashtags */}
								<FormField
									control={form.control}
									name="includeHashtags"
									render={({ field }) => (
										<FormItem className="flex flex-row items-start space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="text-sm font-normal">
													Include Hashtags
												</FormLabel>
												<FormDescription className="text-xs">
													Add relevant hashtags to increase discoverability
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</div>

							{/* Number of Variations */}
							<FormField
								control={form.control}
								name="variations"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Number of Variations</FormLabel>
										<Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
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
											Choose how many different tweet variations you'd like to generate.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Generate Button */}
							<Button type="submit" disabled={isGenerating} className="w-full">
								{isGenerating ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Generating Tweet...
									</>
								) : (
									<>
										<Wand2 className="mr-2 h-4 w-4" />
										Generate Tweet
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Generated Tweet Display */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Wand2 className="h-5 w-5" />
						Generated Tweet
					</CardTitle>
					<CardDescription>
						Your AI-generated, human-like tweet ready to post.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{generatedTweets.length > 0 ? (
						<div className="space-y-4">
							{/* Tweet Variation Selector */}
							{generatedTweets.length > 1 && (
								<div className="flex gap-2 flex-wrap">
									{generatedTweets.map((_, index) => (
										<Button
											key={index}
											variant={selectedTweetIndex === index ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedTweetIndex(index)}
										>
											Variation {index + 1}
										</Button>
									))}
								</div>
							)}

							{/* Tweet Content */}
							<div className="bg-muted/50 rounded-lg p-4 border">
								<div className="whitespace-pre-wrap text-sm leading-relaxed">
									{generatedTweets[selectedTweetIndex]}
								</div>
								<div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
									Character count: {generatedTweets[selectedTweetIndex]?.length ?? 0}/280
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<Button onClick={copyToClipboard} variant="outline" className="flex-1">
									<Copy className="mr-2 h-4 w-4" />
									Copy Tweet
								</Button>
								<Button onClick={downloadTweet} variant="outline" className="flex-1">
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</div>
						</div>
					) : (
						<div className="text-center py-12 text-muted-foreground">
							<Twitter className="mx-auto h-12 w-12 mb-4 opacity-50" />
							<p className="text-lg font-medium mb-2">No tweet generated yet</p>
							<p className="text-sm">
								Fill out the form and click "Generate Tweet" to create your human-like tweet.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}