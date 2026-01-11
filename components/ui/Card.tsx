import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-ios-sm border border-black/5 ${padding} ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-200' : ''}`}
    >
      {children}
    </div>
  );
};