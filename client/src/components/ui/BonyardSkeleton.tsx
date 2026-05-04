import React from 'react';

const BonyardSkeleton = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col p-6 overflow-hidden">
      {/* Navbar Skeleton */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between h-16 mb-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton" />
          <div className="h-6 w-32 rounded-lg skeleton" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-20 rounded skeleton" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded-xl skeleton" />
          <div className="h-10 w-32 rounded-xl skeleton" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center mt-20">
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-32 rounded-full skeleton" />
          ))}
        </div>
        
        <div className="h-20 w-full max-w-2xl rounded-2xl skeleton mb-6" />
        <div className="h-20 w-full max-w-3xl rounded-2xl skeleton mb-10" />
        
        <div className="h-6 w-full max-w-xl rounded-lg skeleton mb-12" />
        
        <div className="h-14 w-48 rounded-full skeleton" />
      </div>

      {/* Floating Elements / Background Skeleton Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
    </div>
  );
};

export default BonyardSkeleton;
