"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import Link from "next/link";

interface TweetEmbedProps {
  username?: string;
  handle?: string;
  avatar?: string;
  content: string;
  timestamp?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
}

export function TweetEmbed({
  username = "User",
  handle = "@user",
  avatar,
  content,
  timestamp = "now",
  likes = 0,
  retweets = 0,
  replies = 0,
}: TweetEmbedProps) {
  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback className="bg-blue-500 text-white">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-bold text-gray-900 dark:text-white">
              {username}
            </span>
            <span className="truncate text-sm text-gray-500 dark:text-gray-400">
              {handle}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timestamp}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-gray-900 dark:text-white">
          {formatContent(content)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex max-w-md items-center justify-between text-gray-500 dark:text-gray-400">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-500 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs">{replies}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-500 hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-950"
        >
          <Repeat2 className="size-4" />
          <span className="text-xs">{retweets}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
        >
          <Heart className="size-4" />
          <span className="text-xs">{likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950"
        >
          <Share className="size-4" />
        </Button>
      </div>
    </div>
  );
}
