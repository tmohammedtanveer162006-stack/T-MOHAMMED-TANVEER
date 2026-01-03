
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const Header: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-3">
      {actions}
    </div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'indigo' | 'slate' | 'rose' | 'emerald' }> = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    slate: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/30 dark:text-slate-300 dark:border-slate-800",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
};
