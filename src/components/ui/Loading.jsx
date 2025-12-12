import React from 'react';

// 1. Spinner (Rodinha girando)
export const Spinner = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`animate-spin ${className}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// 2. Skeleton (Bloco cinza pulsante)
export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>
);

// 3. Skeleton específico para Tabelas (Linhas)
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4 p-4">
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" /> {/* Nome */}
          <Skeleton className="h-3 w-1/4" /> {/* CPF */}
        </div>
        <Skeleton className="h-8 w-20" /> {/* Status */}
      </div>
    ))}
  </div>
);

// 4. Skeleton específico para Cards do Dashboard
export const CardSkeleton = () => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-3">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-full">
        <Skeleton className="h-3 w-1/2" /> {/* Título */}
        <Skeleton className="h-8 w-1/3" /> {/* Valor */}
      </div>
      <Skeleton className="h-10 w-10 rounded-xl" /> {/* Ícone */}
    </div>
    <Skeleton className="h-3 w-3/4" /> {/* Subtexto */}
  </div>
);