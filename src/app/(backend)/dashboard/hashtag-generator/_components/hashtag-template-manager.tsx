"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useState } from "react";

export default function HashtagTemplateManager() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");

  const { mutate: createTemplate } = api.templates.create.useMutation({
    onSuccess: () => {
      // Reset form on success
      setName("");
      setDescription("");
      setHashtags("");
    },
  });

  const handleCreateTemplate = () => {
    const hashtagList = hashtags.split(/[ ,]+/).filter(Boolean);
    createTemplate({
      name,
      description,
      hashtags: hashtagList,
      platform: "all",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Custom Hashtag Template</CardTitle>
        <CardDescription>
          Define custom hashtag sets or templates for specific use cases.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Template Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this template..."
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Hashtags</label>
          <Textarea
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#hashtag1 #hashtag2 #hashtag3..."
            className="mt-1"
          />
        </div>
        <Button onClick={handleCreateTemplate} className="w-full">
          Create Template
        </Button>
      </CardContent>
    </Card>
  );
}
