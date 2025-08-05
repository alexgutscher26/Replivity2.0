"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import { api } from "@/trpc/react";
import { Chrome, Flame } from "lucide-react";

/**
 * Renders an SVG arrow pointing upwards.
 */
const ArrowTop = ({ className }: { className?: string }) => (
  <svg
    width="65"
    height="42"
    viewBox="0 0 65 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M63.5 1C63.5 13.9167 48.2 36.5 17.5 40.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 35.5L18 40.5L14.5 25.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Renders an SVG arrow pointing left with optional custom styling.
 */
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg
    width="50"
    height="49"
    viewBox="0 0 50 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M1 1C1 14.4167 17.1 38 48.5 44"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M33 48L48.5 43.5L46 28"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Renders an arrow pointing to the right as an SVG element.
 */
const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    width="66"
    height="49"
    viewBox="0 0 66 49"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M65 1C65 14.4167 48.9 38 17.5 44"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 38L17.5 43.5L15 28"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Renders a floating annotation with optional styling and children content.
 */
const FloatingAnnotation = ({
  children,
  className,
  arrow,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  arrow: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    className={cn(
      'hidden lg:block absolute text-gray-300 animate-float w-max',
      className
    )}
    style={style}
  >
    {children}
    {arrow}
  </div>
);

/**
 * Renders a Hero component showcasing AI-powered social media extension features.
 *
 * This component fetches settings and download information using suspense queries.
 * It displays a visually appealing section with annotations, headings, paragraphs,
 * and buttons for downloading the extension on Chrome and Firefox. The styles include
 * radial gradients, animations, and responsive design elements.
 */
const Hero = () => {
  const [settings] = api.settings.site.useSuspenseQuery();
  const [download] = api.settings.downloadExtension.useSuspenseQuery();

  return (
    <section className="relative bg-black isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(rgb(55 65 81) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: '0.15',
        }}
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-transparent to-black"
        style={{ opacity: 0.8 }}
      />

      <div className="container mx-auto px-6 pt-24 pb-20 md:pt-40 md:pb-28">
        <div className="relative max-w-4xl mx-auto">
          <FloatingAnnotation
             className="top-[-4rem] left-1/2 -translate-x-1/2 text-center"
             arrow={<ArrowTop className="mx-auto mt-2" />}
             style={{ animationDelay: '0.5s' }}
           >
             <p>Browser extension for all platforms</p>
           </FloatingAnnotation>

          <FloatingAnnotation
             className="top-8 -left-12 sm:-left-24 md:-left-44 text-right"
             arrow={<ArrowLeft className="ml-auto mt-2" />}
             style={{ animationDelay: '0s' }}
           >
             <p>
               AI-powered social
               <br />
               media responses
             </p>
           </FloatingAnnotation>
            
           <FloatingAnnotation
             className="top-12 -right-16 sm:-right-28 md:-right-52 text-left"
             arrow={<ArrowRight className="mr-auto mt-2" />}
             style={{ animationDelay: '1s' }}
           >
             <p>
               Smart comment
               <br />
               generation
             </p>
           </FloatingAnnotation>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter max-w-4xl leading-tight">
              <span className="text-emerald-400">AI-powered</span> social media extension for everyone
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed hidden sm:block">
               {settings?.name} is a browser extension available for Chrome and
               Firefox that uses AI models to help you write better social
               media posts and reply to comments faster.
             </p>
             <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed sm:hidden">
               Write better social media posts and reply to comments faster
               with {settings?.name}. Available for Chrome and Firefox.
             </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Button
                asChild
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg px-8 h-12 text-base transition-all duration-300"
              >
                <Link href={download.chrome! ?? "#"}>
                  <Chrome className="relative size-5" />
                  <span>Download for Chrome</span>
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg px-8 h-12 text-base transition-all duration-300"
              >
                <Link href={download.firefox! ?? "#"}>
                  <Flame className="relative size-5" />
                  <span>Download for Firefox</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(-0.5deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.5deg);
          }
          100% {
            transform: translateY(0px) rotate(-0.5deg);
          }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
