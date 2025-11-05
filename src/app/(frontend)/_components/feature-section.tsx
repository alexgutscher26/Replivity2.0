import { Activity, DraftingCompass, Mail, Zap } from "lucide-react";
import Image from "next/image";

/**
 * Renders the Features section with social media growth highlights and an illustration.
 */
export default function FeaturesSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-black py-16 md:py-32"
      id="features"
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

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-bold tracking-tighter text-white lg:text-5xl">
                Built for{" "}
                <span className="text-emerald-400">Social Media Growth</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                AI is the future of social media marketing. Our platform is
                designed to help you grow your social media presence with
                cutting-edge AI technology.
              </p>
            </div>
            <ul className="mt-8 divide-y divide-gray-700 border-y border-gray-700 *:flex *:items-center *:gap-3 *:py-3">
              <li className="text-gray-300">
                <Mail className="size-5 text-emerald-400" />
                Human like interactions and responses
              </li>
              <li className="text-gray-300">
                <Zap className="size-5 text-emerald-400" />
                Fast response time
              </li>
              <li className="text-gray-300">
                <Activity className="size-5 text-emerald-400" />
                Guaranteed growth in followers
              </li>
              <li className="text-gray-300">
                <DraftingCompass className="size-5 text-emerald-400" />
                Advanced analytics and insights
              </li>
            </ul>
          </div>
          <div className="relative rounded-3xl border border-gray-600 bg-gray-900/50 p-3 lg:col-span-3">
            <div className="relative aspect-76/59 rounded-2xl bg-gradient-to-b from-gray-600 to-transparent p-px">
              <Image
                src="https://oz9ry1x8bp.ufs.sh/f/QJPPsA2erx3UnltDJjsAk2fj1SRanoqiWcUghYBDQPlpeMvV"
                className="rounded-[15px]"
                alt="AI social media features illustration"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
