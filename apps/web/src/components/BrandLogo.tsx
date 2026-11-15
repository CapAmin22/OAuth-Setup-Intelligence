import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withContainer?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  withContainer = true,
}) => {
  const sizeMap = {
    xs: { container: 'w-6 h-6 rounded-md', img: 'w-4 h-4' },
    sm: { container: 'w-7 h-7 rounded-lg', img: 'w-5 h-5' },
    md: { container: 'w-8 h-8 rounded-lg', img: 'w-6 h-6' },
    lg: { container: 'w-10 h-10 rounded-xl', img: 'w-7 h-7' },
    xl: { container: 'w-12 h-12 rounded-2xl', img: 'w-9 h-9' },
  };

  const { container, img } = sizeMap[size];

  if (!withContainer) {
    return (
      <img
        src="/brand-spearhead.png"
        alt="OAuth Setup Intelligence Logo"
        className={`${img} object-contain ${className}`}
        loading="eager"
      />
    );
  }

  return (
    <div
      className={`${container} bg-gradient-to-b from-sand-100 to-sand-200/80 border border-sand-300/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform ${className}`}
    >
      <img
        src="/brand-spearhead.png"
        alt="OAuth Setup Intelligence Logo"
        className="w-full h-full object-cover object-center scale-110"
        loading="eager"
      />
    </div>
  );
};
