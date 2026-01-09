import React from 'react';

/**
 * Simple skeleton placeholder used while loading cards.
 * Renders a gray animated block mimicking the size of a card.
 */
export default function CardSkeleton() {
    return (
        <div className="h-40 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    );
}
