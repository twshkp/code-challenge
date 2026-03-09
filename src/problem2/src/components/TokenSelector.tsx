import { useState, useMemo } from 'react';
import { Token } from '../types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Search } from 'lucide-react';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  disabledToken?: Token | null;
  label?: string;
}

const FALLBACK_COLORS = [
  '#6c63ff', '#ff6b6b', '#ffd93d', '#2ed573', '#1e90ff',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#ff6348', '#2bcbba',
];

function getColorForCurrency(currency: string): string {
  let hash = 0;
  for (let i = 0; i < currency.length; i++) {
    hash = currency.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

function TokenIcon({ token }: { token: Token }) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !token.icon) {
    return (
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-foreground flex-shrink-0"
        style={{ background: getColorForCurrency(token.currency) }}
      >
        {token.currency.charAt(0)}
      </span>
    );
  }

  return (
    <img
      className="w-6 h-6 rounded-full object-contain bg-input"
      src={token.icon}
      alt={token.currency}
      onError={() => setImgError(true)}
    />
  );
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  disabledToken,
  label = 'Select token',
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTokens = useMemo(() =>
    tokens.filter(t => t.currency.toLowerCase().includes(search.toLowerCase())),
    [tokens, search]
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-muted hover:border-muted whitespace-nowrap",
            !selectedToken && "text-white bg-white/10 border-white/20 hover:bg-white/15"
          )}
        >
          {selectedToken ? (
            <>
              <TokenIcon token={selectedToken} />
              <span className="text-foreground">{selectedToken.currency}</span>
            </>
          ) : (
            <span>{label}</span>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-background border-border rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]" align="end" sideOffset={8}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
            autoFocus
          />
        </div>
        <ScrollArea className="h-[280px]">
          <div className="p-1.5">
            {filteredTokens.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-[13px]">No tokens found</div>
            ) : (
              filteredTokens.map((token) => {
                const isSelected = selectedToken?.currency === token.currency;
                const isDisabled = disabledToken?.currency === token.currency;
                return (
                  <div
                    key={token.currency}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !isDisabled && handleSelect(token)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                      isSelected && "bg-white/10",
                      isDisabled && "opacity-35 pointer-events-none",
                      !isSelected && !isDisabled && "hover:bg-input"
                    )}
                  >
                    <TokenIcon token={token} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{token.currency}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
