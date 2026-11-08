import React from 'react';

function getInitials(name = '') {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return initials || '?';
}

export default function Avatar({ name, src = '', className = '' }) {
  if (src) {
    return <img src={src} alt={name || 'User avatar'} className={`${className} object-cover`} />;
  }

  return (
    <span
      role="img"
      aria-label={name || 'User avatar'}
      className={`${className} flex items-center justify-center bg-teal-100 text-teal-800 font-bold font-mono`}
    >
      {getInitials(name)}
    </span>
  );
}
