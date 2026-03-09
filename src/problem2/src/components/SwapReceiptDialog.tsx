import { useState, useEffect, useCallback } from 'react';
import { Token } from '../types';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { formatConfirmedRate } from '../utils/exchange';
import { ArrowDown, Check, Loader2 } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface SwapReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromUsdValue: string | null;
  toUsdValue: string | null;
}

type Phase = 'receipt' | 'swapping' | 'success';

/* -------------------------------------------------------------------------- */
/*  TokenIcon                                                                 */
/* -------------------------------------------------------------------------- */

function TokenIcon({
  token,
  size = 'md',
}: {
  token: Token;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [error, setError] = useState(false);
  const sizeMap = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-10 h-10' };

  if (error || !token.icon) {
    return (
      <span
        className={cn(
          sizeMap[size],
          'rounded-full bg-secondary/50 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0',
        )}
      >
        {token.currency.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={token.icon}
      alt={token.currency}
      className={cn(sizeMap[size], 'rounded-full')}
      onError={() => setError(true)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Phase: receipt                                                            */
/* -------------------------------------------------------------------------- */

function ReceiptContent({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  fromUsdValue,
  toUsdValue,
  onConfirm,
  onCancel,
}: {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromUsdValue: string | null;
  toUsdValue: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmedRate = formatConfirmedRate(fromToken, toToken);
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6 pt-2">
        <h2 className="text-base font-semibold text-foreground">Review Swap</h2>
      </div>

      {/* From */}
      <div className="bg-secondary/50 rounded-xl p-4 mx-6 mb-2">
        <div className="text-xs text-muted-foreground mb-2">You pay</div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-foreground">
            {fromAmount}
          </span>
          <div className="flex items-center gap-2">
            <TokenIcon token={fromToken} />
            <span className="text-sm font-medium text-foreground">
              {fromToken.currency}
            </span>
          </div>
        </div>
        {fromUsdValue && (
          <div className="text-xs text-muted-foreground mt-1">
            ${fromUsdValue}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-2 relative z-[1]">
        <div className="w-8 h-8 rounded-full bg-secondary/50 border border-border flex items-center justify-center">
          <ArrowDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* To */}
      <div className="bg-secondary/50 rounded-xl p-4 mx-6 mt-2 mb-4">
        <div className="text-xs text-muted-foreground mb-2">You receive</div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-foreground">
            {toAmount}
          </span>
          <div className="flex items-center gap-2">
            <TokenIcon token={toToken} />
            <span className="text-sm font-medium text-foreground">
              {toToken.currency}
            </span>
          </div>
        </div>
        {toUsdValue && (
          <div className="text-xs text-muted-foreground mt-1">
            ${toUsdValue}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3 py-4 mx-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rate</span>
          <span className="text-foreground text-xs">{confirmedRate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Network fee</span>
          <span className="text-foreground">~0.005 {fromToken.currency}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Slippage tolerance</span>
          <span className="text-foreground">0.5%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl text-base font-semibold bg-white text-black hover:bg-neutral-200 transition-all active:scale-[0.985]"
        >
          Confirm Swap
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Phase: swapping                                                           */
/* -------------------------------------------------------------------------- */

function SwappingContent() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">Processing swap...</p>
      <p className="text-xs text-muted-foreground/60">
        This may take a moment
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Phase: success                                                            */
/* -------------------------------------------------------------------------- */

function SuccessContent({
  fromAmount,
  fromToken,
  toAmount,
  toToken,
  onDone,
}: {
  fromAmount: string;
  fromToken: Token;
  toAmount: string;
  toToken: Token;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-success-pop">
        <Check className="w-8 h-8 text-success" />
      </div>
      <div className="text-lg font-semibold text-foreground">
        Swap Successful!
      </div>
      <div className="text-[13px] text-muted-foreground">
        {fromAmount} {fromToken.currency} &rarr; {toAmount} {toToken.currency}
      </div>
      <button
        type="button"
        onClick={onDone}
        className="mt-4 w-full max-w-[240px] py-3 bg-white/10 border border-white/10 rounded-xl text-foreground text-sm font-medium hover:bg-white/15 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function SwapReceiptDialog({
  open,
  onOpenChange,
  onConfirmed,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  fromUsdValue,
  toUsdValue,
}: SwapReceiptDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const [phase, setPhase] = useState<Phase>('receipt');

  // Reset phase whenever the dialog opens
  useEffect(() => {
    if (open) setPhase('receipt');
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /*  Handlers                                                              */
  /* ---------------------------------------------------------------------- */

  const handleConfirmSwap = useCallback(() => {
    setPhase('swapping');
    setTimeout(() => setPhase('success'), 2000);
  }, []);

  const handleDone = useCallback(() => {
    onConfirmed();
  }, [onConfirmed]);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      // Prevent closing while swap is in progress or on success screen
      if (!value && phase !== 'receipt') return;
      onOpenChange(value);
    },
    [phase, onOpenChange],
  );

  const preventInteraction = useCallback(
    (e: Event) => {
      if (phase !== 'receipt') e.preventDefault();
    },
    [phase],
  );

  /* ---------------------------------------------------------------------- */
  /*  Shared inner content                                                  */
  /* ---------------------------------------------------------------------- */

  const content = (
    <>
      {phase === 'receipt' && (
        <ReceiptContent
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          toAmount={toAmount}
          fromUsdValue={fromUsdValue}
          toUsdValue={toUsdValue}
          onConfirm={handleConfirmSwap}
          onCancel={() => onOpenChange(false)}
        />
      )}
      {phase === 'swapping' && <SwappingContent />}
      {phase === 'success' && (
        <SuccessContent
          fromAmount={fromAmount}
          fromToken={fromToken}
          toAmount={toAmount}
          toToken={toToken}
          onDone={handleDone}
        />
      )}
    </>
  );

  /* ---------------------------------------------------------------------- */
  /*  Desktop: centered Dialog                                              */
  /* ---------------------------------------------------------------------- */

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-[440px] p-0 bg-card border border-border rounded-3xl overflow-hidden"
          onInteractOutside={preventInteraction}
          onEscapeKeyDown={preventInteraction}
        >
          <DialogTitle className="sr-only">Swap Review</DialogTitle>
          <DialogDescription className="sr-only">
            Review your swap details before confirming
          </DialogDescription>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*  Mobile: bottom Sheet                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="max-h-[90vh]"
        onInteractOutside={preventInteraction}
        onEscapeKeyDown={preventInteraction}
      >
        <SheetTitle className="sr-only">Swap Review</SheetTitle>
        <SheetDescription className="sr-only">
          Review your swap details before confirming
        </SheetDescription>
        {content}
      </SheetContent>
    </Sheet>
  );
}
