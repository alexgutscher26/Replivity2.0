import React from 'react';

const StatsSection = () => {
  return (
    <section className="relative bg-black py-24 sm:py-32 isolate overflow-hidden">
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
      
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tighter leading-tight text-white">
          Transform your <span className="text-emerald-400">social media</span>
          <br />
          engagement with AI.
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300 leading-relaxed">
          Generate authentic, engaging responses that build meaningful connections
          with your audience while maintaining your unique brand voice.
        </p>
      </div>
    </section>
  );
};

export default StatsSection;