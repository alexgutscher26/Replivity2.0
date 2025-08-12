import { postSchema } from '@/schemas/post'
import { generationTypeSchema, sourceSchema } from '@/schemas/source'
import { createTRPCReact } from '@trpc/react-query'
import { initTRPC, TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import mitt from 'mitt'
import { createChromeHandler } from 'trpc-chrome/adapter'
import { defineBackground } from 'wxt/sandbox'
import z from 'zod'

type Events = Record<string, unknown> & {
  greeting: string
  updateTimestamp: number
}

const ee = mitt<Events>()

const t = initTRPC.create({
  allowOutsideOfServer: true,
  isServer: false,
})

// Uncomment below eslint comments to temporarily turn off object sorting
// /* eslint-disable perfectionist/sort-objects */
const router = t.router({
  generate: t.procedure.input(postSchema.extend({
    source: sourceSchema,
    tone: z.string(),
    type: generationTypeSchema,
  })).output(z.object({
    confidence: z.number().optional(),
    contextAnalysis: z.any().optional(),
    remainingUsage: z.number(),
    text: z.string(),
  })).mutation(async ({ input }) => {
    const { handle, images, quotedPost, source, text, tone, type, url, username, video } = input

    // Enhanced content preparation with better structure
    const enhancedContent = prepareEnhancedContent({
      images,
      quotedPost,
      source,
      text,
      type,
      video,
    })

    const res = await fetch(new URL('/api/ai', import.meta.env.WXT_SITE_URL).href, {
      body: JSON.stringify({
        author: username ?? handle,
        link: url,
        // Add metadata for better context
        metadata: {
          contentLength: text.length,
          hasImages: images && images.length > 0,
          hasQuotedPost: !!quotedPost,
          hasVideo: !!video,
        },
        post: enhancedContent,
        source,
        tone,
        type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const data = await res.json()

    if (!res.ok) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `Error fetching data: ${data.error || 'Unknown error'}`,
      })
    }

    return data
  }),
  greeting: t.procedure.input(z.object({ name: z.string() })).query((req) => {
    const { input } = req
    ee.emit('greeting', `Greeted ${input.name}`)

    return `Hello ${input.name}` as const
  }),
  onGreeting: t.procedure.subscription(() => {
    return observable((emit) => {
      function onGreet(hello: string) {
        emit.next(hello)
      }

      ee.on('greeting', onGreet)

      return () => {
        ee.off('greeting', onGreet)
      }
    })
  }),
  usage: t.procedure.query(async () => {
    const res = await fetch(new URL('/api/usage', import.meta.env.WXT_SITE_URL).href, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(`Error fetching data: ${data.message || 'Unknown error'}`)
    }
    return data
  }),
})
// /* eslint-enable perfectionist/sort-objects */

export type AppRouter = typeof router
export const trpcReact = createTRPCReact<AppRouter>()

export default defineBackground({
  main() {
    createChromeHandler({
      createContext: undefined,
      onError: undefined,
      router,
    })
  },
  type: 'module',
})

// Remove this entire function - it's overriding the global WXT function
// function defineBackground(_arg0: { main: () => void, type: string }) {
//   throw new Error('Function not implemented.')
// }

// Enhanced content preparation function
function prepareEnhancedContent({
  images,
  quotedPost,
  source,
  text,
  type,
  video,
}: {
  images?: string[]
  quotedPost?: any
  source: string
  text: string
  type: string
  video?: any
}) {
  let enhancedContent = text

  // Add structured media information
  if (images && images.length > 0) {
    enhancedContent += '\n\n[MEDIA CONTEXT]'
    enhancedContent += `\nImages (${images.length}): Visual content that may influence response tone and context`
    // Only include first few image URLs to avoid token limits
    images.slice(0, 3).forEach((imageUrl, index) => {
      enhancedContent += `\n  ${index + 1}. ${imageUrl}`
    })
    if (images.length > 3) {
      enhancedContent += `\n  ... and ${images.length - 3} more images`
    }
  }

  if (video) {
    enhancedContent += '\n\n[VIDEO CONTENT]'
    enhancedContent += `\nVideo URL: ${video.url}`
    if (video.poster) {
      enhancedContent += `\nThumbnail: ${video.poster}`
    }
  }

  if (quotedPost) {
    enhancedContent += '\n\n[QUOTED CONTENT]'
    enhancedContent += `\nQuoted from @${quotedPost.handle}: ${quotedPost.text}`

    if (quotedPost.images?.length > 0) {
      enhancedContent += `\nQuoted post has ${quotedPost.images.length} image(s)`
    }

    if (quotedPost.video) {
      enhancedContent += '\nQuoted post includes video content'
    }
  }

  // Add platform and type context
  enhancedContent += `\n\n[GENERATION CONTEXT]`
  enhancedContent += `\nPlatform: ${source}`
  enhancedContent += `\nType: ${type}`
  enhancedContent += `\nContent Length: ${text.length} characters`

  return enhancedContent
}
