import type { SourcePlatform } from '@/schemas/source'
import type { StatusFormData } from '@/schemas/status'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useContentParser } from '@/hooks/useContentParser'
import { useTRPC } from '@/hooks/useTRPC'
import { statusSchema } from '@/schemas/status'
import { tones } from '@/schemas/tone'
import { zodResolver } from '@hookform/resolvers/zod'
import { TRPCClientError } from '@trpc/client'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

/**
 * Status component to generate and manage status updates based on user input.
 *
 * This component initializes a form with fields for keywords and tone, checks usage limits,
 * and handles form submission to generate status updates. It also displays usage data and
 * alerts if the usage limit is reached.
 *
 * @param source - The platform source from which the content is generated.
 */
export function Status({ source }: { source: SourcePlatform }) {
  const trpc = useTRPC()
  const parser = useContentParser(source)
  const formRef = useRef<HTMLFormElement>(null)
  const [loadingTone, setLoadingTone] = useState<null | string>(null)
  const [usageData, setUsageData] = useState<any>(null)
  const [usageLimitReached, setUsageLimitReached] = useState(false)

  // Check usage status on component mount
  useEffect(() => {
    /**
     * Fetches and processes the current usage data from the API.
     *
     * This function queries the usage data using `trpc.usage.query()`. If successful,
     * it updates the state with the fetched usage data using `setUsageData(usage)`.
     * It then checks if the current month's total usage has reached or exceeded
     * the plan limit. If so, it sets the `usageLimitReached` state to true.
     *
     * In case of an error during the fetch operation, it logs the error to the console.
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

  const form = useForm<StatusFormData>({
    defaultValues: {
      keyword: '',
      tone: 'neutral', // Set default tone
    },
    resolver: zodResolver(statusSchema),
  })

  /**
   * Handles form submission and processes the generated status text.
   *
   * This function checks if the usage limit is reached before attempting generation.
   * If not, it proceeds to generate the status text using the provided form data,
   * updates the usage data, and handles any potential errors during the process.
   * It also ensures that the loading tone is reset regardless of the outcome.
   *
   * @param formData - An object containing the keyword, tone, and other relevant form data.
   */
  const onSubmit = async (formData: StatusFormData) => {
    // Check if usage limit is reached before attempting generation
    if (usageLimitReached) {
      await parser.setText('Usage limit exceeded for current billing period. Please upgrade your plan to continue.', formRef.current || undefined)
      return
    }

    setLoadingTone(formData.tone)
    try {
      const response = await trpc.generate.mutate({
        source,
        text: formData.keyword,
        tone: formData.tone,
        type: 'status',
      })
      if (!response)
        return

      await parser.setText(response.text, formRef.current || undefined)

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
        await parser.setText('Usage limit exceeded for current billing period. Please upgrade your plan to continue.', formRef.current || undefined)
      }
      else {
        await parser.setText(error instanceof TRPCClientError ? error.message : 'Error: Unknown error', formRef.current || undefined)
      }
    }
    finally {
      setLoadingTone(null)
    }
  }

  return (
    <Form {...form}>
      {usageLimitReached && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded mb-2">
          <AlertTriangle className="h-3 w-3" />
          <span>Usage limit reached</span>
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
      >
        <FormField
          control={form.control}
          name="keyword"
          render={({ field }) => (
            <FormItem className="flex-1 relative z-10">
              <FormControl>
                <input
                  placeholder="Enter keywords to inspire your tweet ..."
                  {...field}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <select
                  {...field}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  value={field.value}
                >
                  {tones.map(({ emoji, name }) => (
                    <option key={name} value={name}>
                      {emoji}
                      {' '}
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={!form.formState.isValid || loadingTone !== null || usageLimitReached}
          title={usageLimitReached ? 'Usage limit exceeded' : 'Generate status'}
          type="submit"
        >
          {loadingTone
            ? (
                <>
                  <Loader2 className="animate-spin" />
                  {' '}
                  Generating
                </>
              )
            : (
                'Generate'
              )}
        </Button>
      </form>
      {usageData && (
        <div className="text-xs text-gray-500 mt-2">
          {usageData.currentMonthTotal}
          /
          {usageData.planLimit}
          {' '}
          used this month
        </div>
      )}
    </Form>
  )
}
