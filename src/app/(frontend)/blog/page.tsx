import { api } from "@/trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Suspense } from "react";
import { type Metadata } from "next";

// Force this page to be dynamic since it uses TRPC calls that require headers
export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

function BlogPostCard({ post }: { post: any }) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
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
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {post.categories.slice(0, 2).map((pc: any) => (
              <Badge key={pc.category.id} variant="secondary" className="text-xs">
                {pc.category.name}
              </Badge>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </h2>
          
          {post.excerpt && (
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(post.publishedAt ?? post.createdAt ?? new Date()), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </div>
            </div>
            <Link 
              href={`/blog/${post.slug}`}
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Read more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlogFilters({ 
  categories, 
  tags, 
  searchParams 
}: {
  categories: any[];
  tags: any[];
  searchParams: {
    search?: string;
    category?: string;
    tag?: string;
    page?: string;
  };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search blog posts..."
          defaultValue={searchParams.search}
          className="pl-10"
          name="search"
        />
      </div>
      
      <Select defaultValue={searchParams.category ?? "all"}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select defaultValue={searchParams.tag ?? "all"}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.slug}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FeaturedPost({ post }: { post: any }) {
  if (!post) return null;
  
  return (
    <Card className="mb-12 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-0">
          {post.featuredImage && (
            <div className="relative aspect-video lg:aspect-auto">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-8 flex flex-col justify-center">
            <Badge className="w-fit mb-4">Featured Post</Badge>
            <h1 className="text-3xl font-bold mb-4">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </h1>
            {post.excerpt && (
              <p className="text-muted-foreground mb-6 text-lg">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(post.publishedAt ?? post.createdAt ?? new Date()), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </div>
            </div>
            <Link href={`/blog/${post.slug}`}>
              <Button size="lg">
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Pagination({ currentPage, totalPages, hasMore }: {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}) {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link href={`/blog?page=${currentPage - 1}`}>
          <Button variant="outline">Previous</Button>
        </Link>
      )}
      
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <Link key={page} href={`/blog?page=${page}`}>
              <Button 
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
              >
                {page}
              </Button>
            </Link>
          );
        })}
      </div>
      
      {hasMore && (
        <Link href={`/blog?page=${currentPage + 1}`}>
          <Button variant="outline">Next</Button>
        </Link>
      )}
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Unwrap searchParams Promise
  const params = await searchParams;
  
  const page = parseInt(params.page ?? "1");
  const limit = 9;
  const offset = (page - 1) * limit;
  
  // Fetch data
  const [postsData, categories, tags] = await Promise.all([
    api.blog.getPosts({
      limit,
      offset,
      status: "published",
      search: params.search,
      sortBy: "publishedAt",
      sortOrder: "desc",
    }),
    api.blog.getCategories(),
    api.blog.getTags(),
  ]);
  
  // Get featured post from the first post if on page 1
  const featuredPost = page === 1 && postsData.posts.length > 0 ? postsData.posts[0] : null;
  
  const totalPages = Math.ceil(postsData.totalCount / limit);
  
  // Generate structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Replivity Blog",
    "description": "Discover insights, tips, and stories about AI social media management and automation.",
    "url": `${baseUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Replivity",
      "url": baseUrl,
    },
    "blogPost": postsData.posts.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${baseUrl}/blog/${post.slug}`,
      "datePublished": post.publishedAt?.toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Replivity Team",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Replivity",
      },
      "image": post.featuredImage ? `${baseUrl}${post.featuredImage}` : `${baseUrl}/og-image.svg`,
      "wordCount": post.readingTime ? post.readingTime * 200 : undefined,
    })),
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
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover insights, tips, and stories from our team. Stay updated with the latest trends and best practices.
          </p>
        </div>
        
        {/* Featured Post */}
        {page === 1 && featuredPost && (
          <FeaturedPost post={featuredPost} />
        )}
        
        {/* Filters */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <BlogFilters 
            categories={categories} 
            tags={tags} 
            searchParams={params}
          />
        </Suspense>
        
        {/* Posts Grid */}
        {postsData.posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new content.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {postsData.posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
            
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              hasMore={postsData.hasMore}
            />
          </>
        )}
      </div>
    </>
  );
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  // Unwrap searchParams Promise
  const params = await searchParams;
  
  let title = "Blog - Latest Posts and Insights";
  let description = "Discover insights, tips, and stories from our team. Stay updated with the latest trends and best practices in AI social media management.";
  
  // Dynamic titles based on search parameters
  if (params.search) {
    title = `Blog - Search: ${params.search}`;
    description = `Search results for "${params.search}" in our blog. Find relevant articles about AI social media management and automation.`;
  } else if (params.category) {
    title = `Blog - ${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Category`;
    description = `Browse all blog posts in the ${params.category} category. Expert insights on AI social media management.`;
  } else if (params.tag) {
    title = `Blog - #${params.tag} Tag`;
    description = `All blog posts tagged with #${params.tag}. Learn about AI social media automation and best practices.`;
  }
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/blog`;
  
  return {
    title,
    description,
    keywords: "AI social media, blog, automation, social media management, AI responses, content generation",
    authors: [{ name: "Replivity Team" }],
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "Replivity",
      images: [{
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Replivity Blog",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/twitter-image.svg`],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}