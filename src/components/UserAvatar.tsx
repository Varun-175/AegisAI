import React, { useState } from 'react';
import { UserProfile } from '../types.js';

interface UserAvatarProps {
  user?: UserProfile | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  forceRobo?: boolean;
}

export function getRobotAvatarUrl(seed?: string): string {
  const cleanSeed = encodeURIComponent(seed || 'vault-architect');
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanSeed}&backgroundColor=0d1117,131822`;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showStatus = false,
  forceRobo = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Derive unique seed based on user identity
  const seed = user?.uid || user?.email || user?.displayName || 'aegis-guardian';
  const roboUrl = getRobotAvatarUrl(seed);

  // If forceRobo is true or if photoURL is missing/failed, use roboUrl
  const avatarSrc = (!forceRobo && user?.photoURL && !imgError) ? user.photoURL : roboUrl;

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  }[size];

  const borderClasses = {
    sm: 'border border-teal-400/40 shadow-sm',
    md: 'border border-teal-400/40 shadow-sm',
    lg: 'border-2 border-teal-400/50 shadow-lg shadow-teal-500/10',
    xl: 'border-2 border-teal-400/50 shadow-xl shadow-teal-500/15',
  }[size];

  const statusDotSize = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-1 -right-1',
    xl: 'w-3.5 h-3.5 -bottom-1 -right-1',
  }[size];

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <img
        src={avatarSrc}
        alt={user?.displayName || 'Robo DP'}
        onError={() => setImgError(true)}
        className={`${sizeClasses} ${borderClasses} object-cover bg-[#090d16] transition-transform duration-200 group-hover:scale-105`}
        referrerPolicy="no-referrer"
      />
      {showStatus && (
        <div
          className={`absolute ${statusDotSize} p-0.5 bg-[#090d16] rounded-full border border-teal-400/50 shadow-sm flex items-center justify-center`}
          title="Active Zero-Trust Session"
        >
          <div className="w-full h-full rounded-full bg-teal-400 animate-pulse" />
        </div>
      )}
    </div>
  );
};
