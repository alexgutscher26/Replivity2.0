import { Separator } from "@/components/ui/separator";
import { TweetGeneratorForm } from "./_components/tweet-generator-form";
import { ServerFeatureAccessGuard } from "@/components/server-feature-access-guard";
import { AVAILABLE_FEATURES } from "@/server/db/schema/feature-permissions-schema";
import { type Metadata } from "next";

export const metadata: Metadata = {
	title: "Tweet Generator - Create Human-like Tweets",
	description: "Generate authentic, human-like tweets that pass AI detection. Create engaging Twitter content with optional emojis and hashtags using advanced AI models.",
	keywords: [
		"tweet generator",
		"Twitter content creation",
		"AI tweet generator",
		"human-like tweets",
		"social media automation",
		"Twitter marketing"
	],
	openGraph: {
		title: "Tweet Generator | Replivity",
		description: "Generate authentic, human-like tweets that pass AI detection. Create engaging Twitter content instantly.",
		type: "website",
		url: "https://replivity.com/dashboard/tweet-generator",
	},
	twitter: {
		card: "summary_large_image",
		title: "Tweet Generator | Replivity",
		description: "Generate authentic, human-like tweets that pass AI detection.",
	},
};

const tweetGeneratorStructuredData = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	"name": "Tweet Generator",
	"description": "AI-powered tweet generator that creates human-like, authentic Twitter content with optional emojis and hashtags.",
	"url": "https://replivity.com/dashboard/tweet-generator",
	"applicationCategory": "BusinessApplication",
	"applicationSubCategory": "Social Media",
	"operatingSystem": "Web Browser",
	"isPartOf": {
		"@type": "WebSite",
		"name": "Replivity",
		"url": "https://replivity.com"
	},
	"creator": {
		"@type": "Organization",
		"name": "Replivity"
	},
	"featureList": [
		"Human-like tweet generation",
		"AI detection bypass",
		"Optional emoji integration",
		"Optional hashtag generation",
		"Multiple tweet variations",
		"Custom tone selection",
		"Brand voice integration"
	]
};

/**
 * Renders the Tweet Generator page with a form for generating tweets.
 */
export default function TweetGeneratorPage() {
	return (
		<>
			{/* Structured Data for Tweet Generator */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(tweetGeneratorStructuredData)
				}}
			/>
			
			<ServerFeatureAccessGuard featureKey={AVAILABLE_FEATURES.TWEET_GENERATOR}>
				<div className="flex-1 space-y-6 p-10 pb-16">
					<div className="space-y-0.5">
						<h2 className="text-2xl font-bold tracking-tight">Tweet Generator</h2>
						<p className="text-muted-foreground">
							Generate authentic, human-like tweets that pass AI detection with optional emojis and hashtags.
						</p>
					</div>
					<Separator />
					<TweetGeneratorForm />
				</div>
			</ServerFeatureAccessGuard>
		</>
	);
}