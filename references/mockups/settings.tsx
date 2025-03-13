import React, { useState } from 'react';
import { ChevronRight, User, Settings, Vibrate, DollarSign, LogOut, ArrowLeft, Info } from 'lucide-react';

const SettingsPage = () => {
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isPro, setIsPro] = useState(true);
  
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="text-white font-bold">22:51</div>
        <div className="flex items-center gap-1">
          <div>•</div>
          <div>•</div>
          <div>•</div>
          <div className="ml-1">83%</div>
        </div>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <button className="text-orange-400">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-white text-2xl font-medium">Settings</h1>
        <button className="text-orange-400">
          <Info size={28} />
        </button>
      </div>
      
      {/* Email with Pro Badge - Clickable */}
      <div 
        className={`mx-4 my-2 border ${isPro ? 'border-yellow-500' : 'border-purple-500'} rounded-lg p-4 flex justify-between items-center cursor-pointer`}
        onClick={() => setIsPro(!isPro)}
      >
        <div>
          <p className="text-gray-400">Email</p>
          <p className={`${isPro ? 'text-yellow-500' : 'text-purple-500'} text-xl`}>chi@weighanchor.com</p>
        </div>
        <div className={`${isPro ? 'bg-yellow-500' : 'bg-purple-500'} text-white px-4 py-1 rounded-full font-bold`}>
          {isPro ? 'Pro' : 'Free'}
        </div>
      </div>
      
      {/* Speech Input Language */}
      <div className="mx-4 my-2 border border-gray-600 rounded-lg p-4">
        <p className="text-gray-400">Speech Input Language</p>
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl">English</h2>
          <ChevronRight color="#ffffff" size={24} />
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="flex-1 px-4 py-2">
        <div className="py-4 flex items-center">
          <div className="bg-gray-700 p-2 rounded-full mr-4">
            <User color="#ffffff" size={24} />
          </div>
          <span className="text-white text-2xl">Profile</span>
        </div>
        
        <div className="py-4 flex items-center">
          <div className="bg-gray-700 p-2 rounded-full mr-4">
            <Settings color="#ffffff" size={24} />
          </div>
          <span className="text-white text-2xl">Tools</span>
        </div>
        
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gray-700 p-2 rounded-full mr-4">
              <Vibrate color="#ffffff" size={24} />
            </div>
            <span className="text-white text-2xl">Haptic Feedback</span>
          </div>
          <div 
            className={`w-16 h-8 rounded-full p-1 cursor-pointer ${hapticFeedback ? 'bg-orange-500' : 'bg-gray-600'}`}
            onClick={() => setHapticFeedback(!hapticFeedback)}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full transform transition-transform ${hapticFeedback ? 'translate-x-8' : 'translate-x-0'}`} 
            />
          </div>
        </div>
        
        <div className="py-4 flex items-center">
          <div className="bg-gray-700 p-2 rounded-full mr-4">
            <DollarSign color="#ffffff" size={24} />
          </div>
          <span className="text-white text-2xl">Billing</span>
        </div>
      </div>
      
      {/* Log Out Button */}
      <div className="px-4 py-6">
        <button className="flex items-center text-red-400 text-2xl">
          <LogOut className="mr-4" size={24} />
          Log out
        </button>
      </div>
      
      {/* Home Bar */}
      <div className="flex justify-center py-8">
        <div className="w-1/3 h-1 bg-gray-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default SettingsPage;