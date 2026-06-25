import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, padding = 'md' }) => {
  return (
    <div
      className={`bg-white border border-gray-200 shadow-sm rounded-lg ${paddingMap[padding]} ${
        hover ? 'hover:shadow-md hover:-translate-y-px transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
