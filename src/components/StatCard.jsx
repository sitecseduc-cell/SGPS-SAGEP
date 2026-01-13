import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export default function StatCard({ title, value, icon: Icon, color, subtext, alert }) {
  // Extract just the color class name for text/bg usage if needed, mostly handled by props

  return (
    <div className={`glass-card p-6 relative overflow-hidden group ${alert ? 'border-red-500/30 bg-red-500/5' : ''}`}>

      {/* Background Gradient Blob on Hover */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-2xl ${alert ? 'bg-red-500' : 'bg-indigo-500'}`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{title}</p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${alert ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl backdrop-blur-sm ${alert ? 'bg-red-100/50 text-red-500' : 'bg-white/50 dark:bg-white/10 text-indigo-600 dark:text-indigo-400'} shadow-sm`}>
          <Icon size={24} />
        </div>
      </div>

      {subtext && (
        <div className="mt-4 flex items-center text-xs font-semibold text-slate-400">
          {alert ? (
            <AlertTriangle size={14} className="mr-1.5 text-red-500" />
          ) : (
            <TrendingUp size={14} className="mr-1.5 text-emerald-500" />
          )}
          <span className={alert ? 'text-red-500/80' : ''}>{subtext}</span>
        </div>
      )}
    </div>
  );
}