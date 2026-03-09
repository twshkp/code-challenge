import { useState, useCallback, useMemo } from 'react';
import { Token, SwapFormState, ValidationError } from '../types';
import { usePrices } from '../hooks/usePrices';
import { calculateOutputAmount, calculateInputAmount, formatRate } from '../utils/exchange';
import { validateSwap } from '../utils/validation';
import { getBalance, formatBalance } from '../utils/mockWallet';
import { TokenSelector } from './TokenSelector';
import { SwapButton } from './SwapButton';
import { SwapReceiptDialog } from './SwapReceiptDialog';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowUpDown, AlertTriangle, Loader2 } from 'lucide-react';

export function SwapForm() {
  const { tokens, loading: pricesLoading, error: pricesError } = usePrices();

  const [formState, setFormState] = useState<SwapFormState>({
    fromToken: null,
    toToken: null,
    fromAmount: '',
    toAmount: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [rotated, setRotated] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fromBalance = formState.fromToken ? getBalance(formState.fromToken) : 0;
  const toBalance = formState.toToken ? getBalance(formState.toToken) : 0;

  const getFieldError = useCallback(
    (field: ValidationError['field']) => errors.find((e) => e.field === field),
    [errors]
  );

  const sanitizeAmount = useCallback((value: string): string => {
    // Reject negative values
    if (value.startsWith('-')) return '';
    // Allow empty string for clearing
    if (value === '') return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    // Cap at a reasonable max (prevent overflow)
    if (num > 999999999) return '999999999';
    return value;
  }, []);

  const handleFromAmountChange = useCallback(
    (value: string) => {
      const sanitized = sanitizeAmount(value);
      setErrors([]);
      const newState: Partial<SwapFormState> = { fromAmount: sanitized };
      if (sanitized && formState.fromToken && formState.toToken) {
        newState.toAmount = calculateOutputAmount(sanitized, formState.fromToken, formState.toToken);
      } else {
        newState.toAmount = '';
      }
      setFormState((prev) => ({ ...prev, ...newState }));
    },
    [formState.fromToken, formState.toToken, sanitizeAmount]
  );

  const handleToAmountChange = useCallback(
    (value: string) => {
      const sanitized = sanitizeAmount(value);
      setErrors([]);
      const newState: Partial<SwapFormState> = { toAmount: sanitized };
      if (sanitized && formState.fromToken && formState.toToken) {
        newState.fromAmount = calculateInputAmount(sanitized, formState.fromToken, formState.toToken);
      } else {
        newState.fromAmount = '';
      }
      setFormState((prev) => ({ ...prev, ...newState }));
    },
    [formState.fromToken, formState.toToken, sanitizeAmount]
  );

  const handleFromTokenSelect = useCallback(
    (token: Token) => {
      setErrors([]);
      setFormState((prev) => {
        const updated = { ...prev, fromToken: token };
        if (prev.fromAmount && token && prev.toToken) {
          updated.toAmount = calculateOutputAmount(prev.fromAmount, token, prev.toToken);
        }
        return updated;
      });
    },
    []
  );

  const handleToTokenSelect = useCallback(
    (token: Token) => {
      setErrors([]);
      setFormState((prev) => {
        const updated = { ...prev, toToken: token };
        if (prev.fromAmount && prev.fromToken && token) {
          updated.toAmount = calculateOutputAmount(prev.fromAmount, prev.fromToken, token);
        }
        return updated;
      });
    },
    []
  );

  const handleSwapDirection = useCallback(() => {
    setErrors([]);
    setRotated(true);
    setTimeout(() => setRotated(false), 350);
    setFormState((prev) => ({
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  }, []);

  const handleMaxClick = useCallback(() => {
    if (!formState.fromToken) return;
    const balance = getBalance(formState.fromToken);
    handleFromAmountChange(balance.toString());
  }, [formState.fromToken, handleFromAmountChange]);

  const handleSubmit = useCallback(() => {
    const validationErrors = validateSwap(
      formState.fromToken,
      formState.toToken,
      formState.fromAmount,
      fromBalance
    );
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setDialogOpen(true);
  }, [formState, fromBalance]);

  const handleDialogConfirmed = useCallback(() => {
    setDialogOpen(false);
    setFormState({ fromToken: null, toToken: null, fromAmount: '', toAmount: '' });
  }, []);

  const rateDisplay = useMemo(() => {
    if (formState.fromToken && formState.toToken) {
      return formatRate(formState.fromToken, formState.toToken);
    }
    return null;
  }, [formState.fromToken, formState.toToken]);

  const fromUsdValue = useMemo(() => {
    if (formState.fromToken && formState.fromAmount) {
      const amt = parseFloat(formState.fromAmount);
      if (!isNaN(amt)) return (amt * formState.fromToken.price).toFixed(2);
    }
    return null;
  }, [formState.fromToken, formState.fromAmount]);

  const toUsdValue = useMemo(() => {
    if (formState.toToken && formState.toAmount) {
      const amt = parseFloat(formState.toAmount);
      if (!isNaN(amt)) return (amt * formState.toToken.price).toFixed(2);
    }
    return null;
  }, [formState.toToken, formState.toAmount]);

  const isDisabled =
    !formState.fromToken ||
    !formState.toToken ||
    !formState.fromAmount ||
    parseFloat(formState.fromAmount) <= 0;

  const generalError = getFieldError('general');
  const fromAmountError = getFieldError('fromAmount');
  const fromTokenError = getFieldError('fromToken');
  const toTokenError = getFieldError('toToken');

  if (pricesLoading) {
    return (
      <Card className="relative z-10 w-full max-w-[480px] p-6 backdrop-blur-xl bg-card/85 border-border shadow-[0_24px_80px_rgba(0,0,0,0.35)] rounded-3xl">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading tokens...</span>
        </div>
      </Card>
    );
  }

  if (pricesError) {
    return (
      <Card className="relative z-10 w-full max-w-[480px] p-6 backdrop-blur-xl bg-card/85 border-border rounded-3xl">
        <div className="text-center py-8 text-destructive text-sm">{pricesError}</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="relative z-10 w-full max-w-[480px] p-6 backdrop-blur-xl bg-card/85 border-border shadow-[0_24px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Swap</h2>
        </div>

        {/* General error banner */}
        {generalError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-destructive/10 border border-destructive/20 rounded-xl mb-4 animate-slide-in-error">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-[13px] text-destructive">{generalError.message}</span>
          </div>
        )}

        {/* From token row */}
        <div className={cn(
          "bg-input rounded-2xl p-4 border border-transparent transition-colors focus-within:border-muted",
          (fromAmountError || fromTokenError) && "!border-destructive/40"
        )}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] text-muted-foreground font-medium">From</span>
            {formState.fromToken && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                Balance: {formatBalance(fromBalance)}
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="px-2 py-0.5 bg-white/10 rounded-md text-white text-[11px] font-bold tracking-wider hover:bg-white/20 transition-colors"
                >
                  MAX
                </button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              min="0"
              step="any"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
              value={formState.fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground text-2xl font-medium placeholder:text-muted-foreground/50"
            />
            <TokenSelector
              tokens={tokens}
              selectedToken={formState.fromToken}
              onSelect={handleFromTokenSelect}
              disabledToken={formState.toToken}
            />
          </div>
          {fromAmountError && <div className="mt-2 text-xs text-destructive animate-slide-in-error">{fromAmountError.message}</div>}
          {fromTokenError && <div className="mt-2 text-xs text-destructive animate-slide-in-error">{fromTokenError.message}</div>}
        </div>

        {/* Swap direction */}
        <div className="flex items-center justify-center my-2 relative z-[2]">
          <button
            type="button"
            onClick={handleSwapDirection}
            aria-label="Swap direction"
            className={cn(
              "w-10 h-10 rounded-full bg-background border-[3px] border-input text-muted-foreground flex items-center justify-center cursor-pointer transition-all duration-250 hover:text-white hover:border-white/30 hover:bg-card hover:rotate-180 active:scale-90",
              rotated && "animate-direction-spin"
            )}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To token row */}
        <div className={cn(
          "bg-input rounded-2xl p-4 border border-transparent transition-colors focus-within:border-muted",
          toTokenError && "!border-destructive/40"
        )}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] text-muted-foreground font-medium">To</span>
            {formState.toToken && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                Balance: {formatBalance(toBalance)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              min="0"
              step="any"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') e.preventDefault(); }}
              value={formState.toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground text-2xl font-medium placeholder:text-muted-foreground/50"
            />
            <TokenSelector
              tokens={tokens}
              selectedToken={formState.toToken}
              onSelect={handleToTokenSelect}
              disabledToken={formState.fromToken}
            />
          </div>
          {toTokenError && <div className="mt-2 text-xs text-destructive animate-slide-in-error">{toTokenError.message}</div>}
        </div>

        {/* Exchange rate */}
        {rateDisplay && (
          <div className="flex flex-col items-center py-3 gap-1">
            <div className="text-[13px] text-muted-foreground">
              <span className="text-muted-foreground/60">Exchange Rate: </span>
              {rateDisplay}
            </div>
            <div className="text-[11px] text-muted-foreground/50">
              Rate is indicative. Final rate will be locked at confirmation.
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="mt-2">
          <SwapButton onClick={handleSubmit} disabled={isDisabled} />
        </div>
      </Card>

      {dialogOpen && formState.fromToken && formState.toToken && (
        <SwapReceiptDialog
          open={dialogOpen}
          onOpenChange={(open) => { if (!open) setDialogOpen(false); }}
          onConfirmed={handleDialogConfirmed}
          fromToken={formState.fromToken}
          toToken={formState.toToken}
          fromAmount={formState.fromAmount}
          toAmount={formState.toAmount}
          fromUsdValue={fromUsdValue}
          toUsdValue={toUsdValue}
        />
      )}
    </>
  );
}
