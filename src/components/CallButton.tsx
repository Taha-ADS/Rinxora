import React from 'react';

interface CallButtonProps {
  /** Not on a call yet: the button beckons. */
  invite: boolean;
  label: string;
  inviteText?: string;
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * The mic. Before a call it breathes, sends out slow rings and carries a
 * rotating ribbon of burgundy and silver light, asking to be pressed.
 */
export const CallButton: React.FC<CallButtonProps> = ({ invite, label, inviteText, onClick, children }) => (
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
    <div className="relative">
      {invite &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute inset-0 rounded-full ring-1 ring-[#FF9CC4]/50 animate-call-ring pointer-events-none"
            style={{ animationDelay: `${i * 0.95}s` }}
          />
        ))}

      <button
        onClick={onClick}
        aria-label={label}
        className="group relative block w-[84px] h-[84px] sm:w-24 sm:h-24 rounded-full cursor-pointer touch-manipulation transition-transform duration-500 ease-lux hover:scale-[1.07] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-300"
      >
        {/* Rotating ribbon of light */}
        <span
          aria-hidden="true"
          className={`absolute -inset-[2px] rounded-full ${invite ? 'animate-halo-fast opacity-100' : 'opacity-40'} transition-opacity duration-700 ease-lux`}
          style={{ background: 'conic-gradient(from 0deg, #FF7A2F, #FFFFFF, #E0247A, #7C3AED, #E3E5EE, #FF7A2F)' }}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full blur-xl bg-[#E0247A]/50 ${invite ? 'animate-call-glow' : 'opacity-40'} pointer-events-none`}
        />
        {/* Glass face */}
        <span className="orb absolute inset-[2px] rounded-full overflow-hidden flex items-center justify-center text-white">
          <span className="orb-gloss absolute inset-0 rounded-full" aria-hidden="true" />
          <span className="relative transition-transform duration-500 ease-lux group-hover:scale-110">{children}</span>
        </span>
      </button>
    </div>

    {invite && inviteText && (
      <span className="mt-5 text-sm sm:text-[15px] font-medium text-titanium-50 tracking-[0.01em] animate-call-label whitespace-nowrap">
        {inviteText}
      </span>
    )}
  </div>
);
