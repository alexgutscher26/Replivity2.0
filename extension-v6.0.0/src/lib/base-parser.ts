import type { PostData } from '@/schemas/post'

import type { ContentParser } from './content-parser'

export abstract class BaseParser implements ContentParser {
  [x: string]: any
  /**
   * Retrieves content as PostData or returns null if not available.
   */
  abstract getContent(): null | PostData

  abstract setText(text: string): Promise<void>

  /**
   * Extracts enhanced context from a given container element.
   *
   * This function analyzes the content of the provided container to extract various metrics
   * such as hashtag, link, and mention counts, as well as word count. It also retrieves engagement
   * metrics, follower count, timestamp, and verification status by calling helper functions.
   */
  protected extractEnhancedContext(container: Element): {
    contentMetrics: {
      hashtagCount: number
      linkCount: number
      mentionCount: number
      wordCount: number
    }
    engagement: { comments: number, likes: number, shares: number }
    followerCount: null | string
    timestamp: Date | null
    verified: boolean
  } {
    const text = container.textContent || ''

    return {
      contentMetrics: {
        hashtagCount: (text.match(/#\w+/g) || []).length,
        linkCount: (text.match(/https?:\/\/\S+/g) || []).length,
        mentionCount: (text.match(/@\w+/g) || []).length,
        wordCount: text.split(/\s+/).length,
      },
      engagement: this.extractEngagementMetrics(container),
      followerCount: this.extractFollowerCount(container),
      timestamp: this.extractTimestamp(container),
      verified: this.isVerifiedAccount(container),
    }
  }

  /**
   * Simulates typing text into an editor element.
   */
  protected simulateTyping(editor: HTMLElement, text: string): void {
    editor.focus()
    let index = 0

    const typeNextChar = () => {
      if (index < text.length) {
        const char = text.charAt(index)
        document.execCommand('insertText', false, char)
        index++
        setTimeout(typeNextChar, 0.01)
      }
    }

    typeNextChar()
  }

  /**
   * Extracts engagement metrics (comments, likes, shares) from a given container element.
   */
  private extractEngagementMetrics(container: Element) {
    // Platform-specific engagement extraction
    return {
      comments: this.extractNumber(container, '[data-testid="reply"]') || 0,
      likes: this.extractNumber(container, '[data-testid="like"]') || 0,
      shares: this.extractNumber(container, '[data-testid="retweet"]') || 0,
    }
  }

  /**
   * Extracts a number from a specified element within a container using a CSS selector.
   *
   * The function searches for an element within the provided container that matches the given selector.
   * If the element is found, it attempts to extract a numeric value from the element's text content.
   * The extracted number can be in a format with commas (e.g., "1,234"), which are removed before parsing.
   * If no valid number is found or the element does not exist, the function returns 0.
   *
   * @param container - The parent DOM element to search within.
   * @param selector - A CSS selector string used to find the target element.
   */
  private extractNumber(container: Element, selector: string): number {
    const element = container.querySelector(selector)
    if (!element)
      return 0

    const text = element.textContent || '0'
    const match = text.match(/([\d,]+)/)
    return match ? Number.parseInt(match[1].replace(/,/g, ''), 10) : 0
  }
}
