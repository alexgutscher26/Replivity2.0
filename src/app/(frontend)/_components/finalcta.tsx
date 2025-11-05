import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Renders a final call-to-action section encouraging users to transform their social media experience.
 */
const FinalCTA = () => {
  return (
    <section className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-4xl leading-tight font-bold tracking-tight text-white md:text-5xl">
          Ready to <span className="text-emerald-400">transform</span> your
          <br />
          social media experience?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
          Join thousands of users who are already creating better social media
          content with AI-powered responses. Get started today and see the
          difference.
        </p>
        <div className="mt-10">
          <Button
            asChild
            className="h-12 rounded-lg bg-emerald-500 px-8 text-base font-bold text-black transition-all duration-300 hover:bg-emerald-600"
          >
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
