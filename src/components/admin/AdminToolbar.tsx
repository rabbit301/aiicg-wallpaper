'use client';

import React from 'react';

interface AdminToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export default function AdminToolbar({ left, right, className = '' }: AdminToolbarProps) {
  return (
    <div className={`mb-3 flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {left}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {right}
      </div>
    </div>
  );
}


