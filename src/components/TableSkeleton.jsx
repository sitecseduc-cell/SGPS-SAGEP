import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 5 }) => {
    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={`head-${i}`} className="h-4 bg-slate-200 rounded w-1/5"></div>
                ))}
            </div>

            {/* Rows Skeleton */}
            <div className="divide-y divide-slate-100">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={`row-${i}`} className="px-6 py-5 flex gap-4">
                        {Array.from({ length: cols }).map((_, j) => (
                            <div key={`cell-${i}-${j}`} className="h-4 bg-slate-100 rounded w-full"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
