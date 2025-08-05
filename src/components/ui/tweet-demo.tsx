import { TweetEmbed } from "@/components/ui/tweet-embed";

function TweetDemo() {
  const tweetContent = `I've been using #SpectrumUI
share your thoughts
@snacksforcode`;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <TweetEmbed
        username="Developer"
        handle="@snacksforcode"
        content={tweetContent}
        timestamp="2m"
        likes={12}
        retweets={3}
        replies={5}
      />
    </div>
  );
}

export { TweetDemo };