"use client";

export default function PrivacyControlSection() {
  return (
    <section className="relative overflow-hidden bg-black py-20 text-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 h-20 w-1 bg-gray-700 opacity-30" />
        <div className="absolute top-32 left-32 h-16 w-1 bg-gray-600 opacity-40" />
        <div className="absolute right-10 bottom-20 h-24 w-1 bg-gray-700 opacity-30" />
        <div className="absolute right-32 bottom-32 h-16 w-1 bg-gray-600 opacity-40" />
        <div className="absolute top-1/2 left-1/4 h-12 w-1 bg-gray-600 opacity-50" />
        <div className="absolute top-1/3 right-1/4 h-12 w-1 bg-gray-600 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Main heading */}
        <div className="mb-20 text-center">
          <h2 className="text-5xl leading-tight font-bold text-balance md:text-6xl xl:text-7xl">
            Keep your brand <span className="text-emerald-400">consistent</span>{" "}
            while
            <br />
            staying <span className="text-emerald-400">authentic.</span>
          </h2>
        </div>

        {/* Single content box */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-700 bg-gray-900/30 p-8 md:p-12">
            <h3 className="mb-6 text-lg font-semibold tracking-wide text-white">
              HOW AI SOCIAL HELPS
            </h3>
            <p className="text-lg leading-relaxed">
              <span className="text-emerald-400">
                Never worry about social media responses again.
              </span>{" "}
              Generate authentic replies that match your brand voice and engage
              your audience.
              <span className="text-emerald-400"> You control</span> the tone,
              style, and messaging while AI handles the heavy lifting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
