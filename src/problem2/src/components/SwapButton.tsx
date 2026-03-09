import { cn } from '@/lib/utils';

interface SwapButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function SwapButton({ onClick, disabled }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-4 px-6 rounded-2xl text-base font-semibold transition-all duration-200 relative overflow-hidden",
        "bg-white text-black",
        "hover:enabled:bg-neutral-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_8px_24px_rgba(255,255,255,0.1)]",
        "active:enabled:translate-y-0 active:enabled:scale-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500",
        !disabled && "animate-pulse-glow"
      )}
    >
      Review Swap
    </button>
  );
}
