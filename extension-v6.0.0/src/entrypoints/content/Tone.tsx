import type { SourcePlatform } from '@/schemas/source'

import { Button } from '@/components/ui/button'
import { useContentParser } from '@/hooks/useContentParser'
import { useTRPC } from '@/hooks/useTRPC'
import { tones } from '@/schemas/tone'
import { TRPCClientError } from '@trpc/client'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Handles tone generation based on user interaction and usage limits.
 *
 * This function manages the state of loading, usage data, and whether the usage limit is reached.
 * It fetches usage data when the component mounts and checks if the usage limit is exceeded.
 * When a button is clicked, it generates content with a specified tone if the usage limit is not reached,
 * updates the usage data, and handles errors appropriately.
 *
 * @param source - The platform from which the source of the content originates.
 */
export function Tone({ source }: { source: SourcePlatform }) {
  const trpc = useTRPC()
  const parser = useContentParser(source)
  const [loadingTone, setLoadingTone] = useState<null | string>(null)
  const [usageData, setUsageData] = useState<any>(null)
  const [usageLimitReached, setUsageLimitReached] = useState(false)

  // Check usage status on component mount
  useEffect(() => {
    /**
     * Fetches and processes usage data from the TRPC API.
     *
     * This function retrieves usage data using the `trpc.usage.query()` method,
     * updates the state with the fetched usage data, and checks if the current
     * month's total usage has reached or exceeded the plan limit. If so, it sets
     * the usage limit reached flag to true. Errors during the fetch operation
     * are logged to the console.
     */
    const checkUsage = async () => {
      try {
        const usage = await trpc.usage.query()
        setUsageData(usage)
        // Check if usage limit is reached
        if (usage?.currentMonthTotal >= usage?.planLimit) {
          setUsageLimitReached(true)
        }
      }
      catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }
    checkUsage()
  }, [])

  /**
   * Handles a button click event to generate content based on selected tone and source.
   *
   * This function first determines the selected tone from the button's text content.
   * It checks if the usage limit is reached and sets an error message if so.
   * If not, it proceeds to fetch content, generates new text using `trpc.generate.mutate`,
   * updates the parser with the generated text, and increments the usage data.
   * It also handles potential errors, updating the usage limit status and setting appropriate error messages.
   *
   * @param e - The React mouse event object associated with the button click.
   */
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const tone = tones.find(({ emoji }) => emoji === e.currentTarget.textContent)
    if (!tone)
      return

    // Check if usage limit is reached before attempting generation
    if (usageLimitReached) {
      await parser.setText('Usage limit exceeded for current billing period. Please upgrade your plan to continue.')
      return
    }

    setLoadingTone(tone.emoji)
    try {
      const content = parser.getContent(e.currentTarget)
      if (!content) {
        await parser.setText('Error: No content found')
        return
      }

      const response = await trpc.generate.mutate({ source, tone: tone.name, type: 'reply', ...content })
      if (!response)
        return

      await parser.setText(response.text)

      // Update usage data after successful generation
      if (usageData) {
        const newUsageData = {
          ...usageData,
          currentMonthTotal: usageData.currentMonthTotal + 1,
        }
        setUsageData(newUsageData)
        // Check if limit is now reached
        if (newUsageData.currentMonthTotal >= newUsageData.planLimit) {
          setUsageLimitReached(true)
        }
      }
    }
    catch (error) {
      if (error instanceof TRPCClientError && error.data?.code === 'FORBIDDEN') {
        setUsageLimitReached(true)
        await parser.setText('Usage limit exceeded for current billing period. Please upgrade your plan to continue.')
      }
      else {
        await parser.setText(error instanceof TRPCClientError ? error.message : 'Error: Unknown error')
      }
    }
    finally {
      setLoadingTone(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {usageLimitReached && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
          <AlertTriangle className="h-3 w-3" />
          <span>Usage limit reached</span>
        </div>
      )}
      <div className="flex">
        {tones.map(({ emoji, name }) => (
          <Button
            disabled={loadingTone !== null || usageLimitReached}
            key={name}
            onClick={handleClick}
            size="icon"
            title={usageLimitReached ? 'Usage limit exceeded' : `Generate ${name} response`}
            variant="ghost"
          >
            {loadingTone === emoji
              ? (
                  <Loader2 className="animate-spin" />
                )
              : (
                  emoji
                )}
          </Button>
        ))}
      </div>
      {usageData && (
        <div className="text-xs text-gray-500">
          {usageData.currentMonthTotal}
          /
          {usageData.planLimit}
          {' '}
          used this month
        </div>
      )}
    </div>
  )
}
