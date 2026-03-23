import React from 'react';

interface DividerProps {
  className?: string;
}

export default function Divider({ className = '' }: DividerProps) {
  return <hr className={`border-slate-100 my-4 ${className}`} />;
}
