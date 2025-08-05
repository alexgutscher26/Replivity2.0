"use client";

export default function PrivacyControlSection() {
  return (
    <section className="bg-black text-white py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-20 w-1 h-20 bg-gray-700 opacity-30" />
        <div className="absolute top-32 left-32 w-1 h-16 bg-gray-600 opacity-40" />
        <div className="absolute bottom-20 right-10 w-1 h-24 bg-gray-700 opacity-30" />
        <div className="absolute bottom-32 right-32 w-1 h-16 bg-gray-600 opacity-40" />
        <div className="absolute top-1/2 left-1/4 w-1 h-12 bg-gray-600 opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-1 h-12 bg-gray-600 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Main heading */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl xl:text-7xl font-bold text-balance leading-tight">
            Keep your brand <span className="text-emerald-400">consistent</span> while
            <br />
            staying <span className="text-emerald-400">authentic.</span>
          </h2>
        </div>

        {/* Single content box */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-8 md:p-12">
            <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">HOW AI SOCIAL HELPS</h3>
            <p className="text-lg leading-relaxed">
              <span className="text-emerald-400">Never worry about social media responses again.</span> Generate authentic replies that match your brand voice and engage your audience.
              <span className="text-emerald-400"> You control</span> the tone, style, and messaging while AI handles the heavy lifting.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}