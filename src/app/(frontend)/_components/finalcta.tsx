import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Renders a final call-to-action section encouraging users to transform their social media experience.
 */
const FinalCTA = () => {
  return (
    <section className="py-24 sm:py-32 bg-black">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
          Ready to <span className="text-emerald-400">transform</span> your
          <br />
          social media experience?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Join thousands of users who are already creating better social media content
          with AI-powered responses. Get started today and see the difference.
        </p>
        <div className="mt-10">
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg px-8 h-12 text-base transition-all duration-300"
          >
            <Link href="/auth/sign-up">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;