import { useState, useEffect } from 'react';
import { Token, TokenPrice } from '../types';

interface UsePricesResult {
  tokens: Token[];
  loading: boolean;
  error: string | null;
}

export function usePrices(): UsePricesResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://interview.switcheo.com/prices.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.statusText}`);
        }

        const data: TokenPrice[] = await response.json();

        // Deduplicate: keep last occurrence if currency appears twice
        const deduped = new Map<string, TokenPrice>();
        for (const item of data) {
          deduped.set(item.currency, item);
        }

        // Omit tokens without a price, then map to Token type
        const result: Token[] = [];
        for (const item of deduped.values()) {
          if (!item.price) continue;
          result.push({
            currency: item.currency,
            price: item.price,
            icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg`,
          });
        }

        setTokens(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load token prices');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  return { tokens, loading, error };
}
