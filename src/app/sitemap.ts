import { type MetadataRoute } from 'next'
import { db } from '@/server/db'
import { blogPosts, blogCategories, blogTags } from '@/server/db/schema/post-schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://replivity.com'
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Tool-specific landing pages (if they become public)
    {
      url: `${baseUrl}/ai-caption-generator`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bio-optimizer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  try {
    // Fetch published blog posts
    const posts = await db.query.blogPosts.findMany({
      where: eq(blogPosts.status, 'published'),
      columns: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
    })

    // Fetch blog categories
    const categories = await db.query.blogCategories.findMany({
      where: eq(blogCategories.isActive, true),
      columns: {
        slug: true,
      },
    })

    // Fetch blog tags
    const tags = await db.query.blogTags.findMany({
      where: eq(blogTags.isActive, true),
      columns: {
        slug: true,
      },
    })

    // Generate blog post URLs
    const blogPostUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: (post.updatedAt ?? post.publishedAt ?? new Date()).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    // Generate blog category URLs
    const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/blog?category=${category.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    // Generate blog tag URLs
    const tagUrls: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/blog?tag=${tag.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }))

    return [...staticPages, ...blogPostUrls, ...categoryUrls, ...tagUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages if database query fails
    return staticPages
  }
}