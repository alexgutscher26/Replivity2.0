import type { PostData } from "@/schemas/post";

import type { ContentParser } from "./content-parser";

export abstract class BaseParser implements ContentParser {
  [x: string]: any;
  abstract getContent(): null | PostData;

  abstract setText(text: string): Promise<void>;

  /**
   * Enhanced content extraction with context analysis
   */
  protected extractEnhancedContext(container: Element): {
    contentMetrics: {
      hashtagCount: number;
      linkCount: number;
      mentionCount: number;
      wordCount: number;
    };
    engagement: { comments: number; likes: number; shares: number };
    followerCount: null | string;
    timestamp: Date | null;
    verified: boolean;
  } {
    const text = container.textContent || "";

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
    };
  }

  protected simulateTyping(editor: HTMLElement, text: string): void {
    editor.focus();
    let index = 0;

    const typeNextChar = () => {
      if (index < text.length) {
        const char = text.charAt(index);
        document.execCommand("insertText", false, char);
        index++;
        setTimeout(typeNextChar, 0.01);
      }
    };

    typeNextChar();
  }

  private extractEngagementMetrics(container: Element) {
    // Platform-specific engagement extraction
    return {
      comments: this.extractNumber(container, '[data-testid="reply"]') || 0,
      likes: this.extractNumber(container, '[data-testid="like"]') || 0,
      shares: this.extractNumber(container, '[data-testid="retweet"]') || 0,
    };
  }

  private extractNumber(container: Element, selector: string): number {
    const element = container.querySelector(selector);
    if (!element) return 0;

    const text = element.textContent || "0";
    const match = text.match(/([\d,]+)/);
    return match ? Number.parseInt(match[1].replace(/,/g, ""), 10) : 0;
  }
}
