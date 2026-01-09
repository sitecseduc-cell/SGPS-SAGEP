import React from 'react';

/**
 * Simple FunnelChart component.
 * Expects `data` as an array of objects: { label: string, count: number, color: string }.
 * Renders a vertical list of bars proportional to the count.
 */
export default function FunnelChart({ loading, data }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    // Find the maximum count to calculate relative widths
    const maxCount = Math.max(...data.map((d) => d.count), 0) || 1;

    return (
        <div className="space-y-4">
            {data.map((segment, idx) => (
                <div key={idx} className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {segment.label}
                    </span>
                    <div
                        className="h-6 rounded"
                        style={{
                            width: `${(segment.count / maxCount) * 100}%`,
                            backgroundColor: segment.color,
                        }}
                    >
                        <span className="ml-2 text-xs text-white">
                            {segment.count}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
