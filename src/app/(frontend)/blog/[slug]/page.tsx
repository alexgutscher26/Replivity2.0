/* eslint-disable @typescript-eslint/no-unsafe-return */
import { api } from "@/trpc/server";
import { db } from "@/server/db";
import { blogPosts } from "@/server/db/schema/post-schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Eye, ArrowLeft, Twitter, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentList } from "@/components/blog/comments";

// Force this page to be dynamic since it uses TRPC calls that require headers
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ShareButtons({ post, url }: { post: any; url: string }) {
  const shareText = `Check out this article: ${post.title}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Share:</span>
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function RelatedPosts({ posts }: { posts: any[] }) {
  if (posts.length === 0) return null;
  
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {post.featuredImage && (
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.publishedAt ?? post.createdAt ?? new Date()), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime} min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TableOfContents({ content }: { content: string }) {
  // Extract headings from content (simple implementation)
  const headings = content.match(/^#{2,3}\s+(.+)$/gm) ?? [];
  
  if (headings.length === 0) return null;
  
  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Table of Contents</h3>
        <nav className="space-y-2">
          {headings.map((heading, index) => {
            const level = /^#{2,3}/.exec(heading)?.[0].length ?? 2;
            const text = heading.replace(/^#{2,3}\s+/, "");
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            
            return (
              <a
                key={index}
                href={`#${id}`}
                className={`block text-sm hover:text-primary transition-colors ${
                  level === 3 ? "ml-4" : ""
                }`}
              >
                {text}
              </a>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Unwrap params Promise
  const { slug } = await params;
  
  // Fetch the blog post and increment view count
  const post = await api.blog.getPost({ slug, incrementView: true });
  
  if (!post) {
    notFound();
  }
  
  // Fetch related posts (recent posts for now)
  const relatedPostsData = await api.blog.getPosts({ 
    status: "published",
    limit: 3,
    offset: 0
  });
  const relatedPosts = relatedPostsData.posts.filter(p => p.id !== post.id).slice(0, 3);
  
  const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/blog/${post.slug}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage ? `${baseUrl}${post.featuredImage}` : `${baseUrl}/og-image.svg`,
    "author": {
      "@type": "Organization",
      "name": "Replivity Team",
      "url": baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Replivity",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/og-image.svg`,
      },
    },
    "datePublished": new Date(post.publishedAt ?? post.createdAt ?? new Date()).toISOString(),
    "dateModified": new Date(post.updatedAt ?? new Date()).toISOString(),
    "url": currentUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl,
    },
    "articleSection": post.categories.map((pc: any) => pc.category.name),
    "keywords": post.seoKeywords ?? post.tags.map((pt: any) => pt.tag.name).join(", "),
    "wordCount": post.readingTime ? post.readingTime * 200 : undefined,
    "timeRequired": post.readingTime ? `PT${post.readingTime}M` : undefined,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
  };
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article>
              {/* Header */}
              <header className="mb-8">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {post.categories.map((pc: any) => (
                      <Badge key={pc.category.id} variant="secondary">
                        <Link href={`/blog?category=${pc.category.slug}`}>
                          {pc.category.name}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Title */}
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                
                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {post.excerpt}
                  </p>
                )}
                
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(post.publishedAt ?? post.createdAt ?? new Date()).toISOString()}>
                      {format(new Date(post.publishedAt ?? post.createdAt ?? new Date()), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} min read
                    </div>
                  )}
                  {post.viewCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount} views
                    </div>
                  )}
                </div>
                
                {/* Share Buttons */}
                <ShareButtons post={post} url={currentUrl} />
              </header>
              
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                {/* Simple content rendering - in a real app, you'd use a markdown parser */}
                <div className="whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
              
              <Separator className="my-8" />
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((pt: any) => (
                      <Badge key={pt.tag.id} variant="outline">
                        <Link href={`/blog?tag=${pt.tag.slug}`}>
                          #{pt.tag.name}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Share Again */}
              <div className="flex items-center justify-between p-6 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold mb-1">Enjoyed this article?</h3>
                  <p className="text-sm text-muted-foreground">
                    Share it with your network!
                  </p>
                </div>
                <ShareButtons post={post} url={currentUrl} />
              </div>
            </article>
            
            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
            
            {/* Comments Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8">Comments</h2>
              <CommentList postId={post.id} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TableOfContents content={post.content} />
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  // Unwrap params Promise
  const { slug } = await params;
  
  try {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, slug),
      with: {
        author: true,
        categories: {
          with: {
            category: true,
          },
        },
        tags: {
          with: {
            tag: true,
          },
        },
      },
    });
    
    if (!post) {
      return {
        title: "Post Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const title = post.seoTitle ?? post.title;
    const description = post.seoDescription ?? post.excerpt ?? `Read ${post.title} on our blog.`;
    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/blog/${post.slug}`;
    
    return {
      title,
      description,
      keywords: post.seoKeywords,
      authors: [{ name: (post.author as { name?: string })?.name ?? "Anonymous" }],
      openGraph: {
        title,
        description,
        type: "article",
        url,
        images: post.featuredImage ? [{
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }] : [],
        publishedTime: new Date(post.publishedAt ?? post.createdAt ?? new Date()).toISOString(),
        authors: [(post.author as { name?: string })?.name ?? "Anonymous"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post",
      description: "Read our latest blog post.",
    };
  }
}

export async function generateStaticParams() {
  try {
    const posts = await db.query.blogPosts.findMany({
      where: eq(blogPosts.status, "published"),
      columns: {
        slug: true,
      },
      limit: 100,
    });
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}