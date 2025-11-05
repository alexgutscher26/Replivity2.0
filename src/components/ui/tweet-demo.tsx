import { TweetEmbed } from "@/components/ui/tweet-embed";

function TweetDemo() {
  const tweetContent = `I've been using #SpectrumUI
share your thoughts
@snacksforcode`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
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
