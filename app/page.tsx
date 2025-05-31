'use client';

import { useState } from 'react';
import ProfileCard from './components/ProfileCard';
import { mockProfiles } from './data/profiles';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedProfiles, setSwipedProfiles] = useState<{[key: string]: string}>({});

  const handleSwipe = (direction: string) => {
    setSwipedProfiles(prev => ({
      ...prev,
      [mockProfiles[currentIndex].linkedin_profile_url]: direction
    }));
    
    if (currentIndex < mockProfiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const currentProfile = mockProfiles[currentIndex];
  const hasMoreProfiles = currentIndex < mockProfiles.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <SparklesIcon className="h-8 w-8 text-blue-400" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            DateAFounder
          </h1>
        </div>
        
        {hasMoreProfiles ? (
          <>
            <ProfileCard
              profile={currentProfile}
              onSwipe={handleSwipe}
            />
            <p className="mt-6 text-gray-400 flex items-center justify-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                Profile {currentIndex + 1} of {mockProfiles.length}
              </span>
            </p>
          </>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-2">No more profiles!</h2>
            <p className="text-gray-400">You've viewed all available profiles.</p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSwipedProfiles({});
              }}
              className="mt-6 bg-blue-500/20 text-blue-400 px-6 py-2 rounded-full font-semibold hover:bg-blue-500/30 transition flex items-center gap-2 mx-auto"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Start Over</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
