"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

/**
 * Renders a content section with social media engagement information.
 */
export default function ContentSection() {
  const [settings] = api.settings.site.useSuspenseQuery();

  return (
    <section
      className="relative isolate overflow-hidden bg-black py-16 md:py-32"
      id="content"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(rgb(55 65 81) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: "0.15",
        }}
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-transparent to-black"
        style={{ opacity: 0.8 }}
      />

      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl text-4xl font-bold tracking-tighter text-white lg:text-5xl">
          <span className="text-emerald-400">Facebook</span>, Twitter, and
          LinkedIn engagement booster.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <div className="relative mb-6 sm:mb-0">
            <div className="relative aspect-76/59 rounded-2xl border border-gray-600 bg-gradient-to-b from-gray-600 to-transparent p-px">
              <Image
                src="https://oz9ry1x8bp.ufs.sh/f/QJPPsA2erx3Ukh6En8rhT2OsaJqXyrv74PUuH1tQGB9izfb6"
                className="rounded-[15px]"
                alt="AI social media engagement illustration"
                width={1207}
                height={929}
              />
            </div>
          </div>

          <div className="relative space-y-4">
            <p className="leading-relaxed text-gray-300">
              Write{" "}
              <span className="font-bold text-emerald-400">
                trending posts, get more likes
              </span>
              , and increase your followers with our AI-powered social media
              marketing platform.
            </p>

            <p className="leading-relaxed text-gray-300">
              Give{" "}
              <span className="font-bold text-emerald-400">custom prompt</span>{" "}
              to our AI model to fit your brand voice and style. Our AI model
              will generate the best possible response for your social media
              posts.
            </p>

            <div className="pt-6">
              <blockquote className="rounded-r-lg border-l-4 border-emerald-400 bg-gray-900/50 p-4 pl-4">
                <p className="leading-relaxed text-gray-300">
                  Using {settings?.name} has been a game-changer for our social
                  media marketing strategy. We have seen a significant increase
                  in engagement and followers since we started using the
                  platform.
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
