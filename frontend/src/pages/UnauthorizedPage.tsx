import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-[#050507] text-[#f5f5f8]">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Access Restricted</h1>
          <p className="text-xs sm:text-sm text-[#b6b6c2] leading-relaxed">
            This module requires verified Government Administrative credentials. Your account is registered as a Citizen Beneficiary.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/citizen/dashboard"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8f8bff] to-[#6fd8ff] text-[#050507] font-semibold text-xs flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Citizen Dashboard</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center space-x-2 border border-white/10"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
