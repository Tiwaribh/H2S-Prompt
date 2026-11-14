'use client';

import React from 'react';
import { getAQICategory } from '@/lib/aqi-utils';

interface AQIBadgeProps {
  aqi: number | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCategory?: boolean;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({ aqi, size = 'md', showCategory = true }) => {
  const cat = getAQICategory(aqi);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-bold',
    xl: 'text-3xl px-5 py-3 font-extrabold',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center rounded-lg border ${cat.badgeClass} ${sizeClasses[size]}`}
      >
        {aqi !== null && aqi !== undefined ? aqi : 'N/A'}
      </span>
      {showCategory && (
        <span className={`text-xs font-medium ${cat.textColor}`}>
          {cat.category}
        </span>
      )}
    </div>
  );
};
