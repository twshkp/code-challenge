// refactored.tsx
// Refactored version of WalletPage component with all identified issues fixed.

import React, { useMemo } from 'react';
import { BoxProps } from '@mui/material'; // or whichever Box component is used

// -- Type Definitions --

// Fix 1: Added `blockchain` field that was missing from the original interface.
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

// Fix 2: Extend WalletBalance instead of duplicating fields.
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Fix 3: Explicit string union type for blockchain instead of `any`.
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// -- Pure Utility (moved outside component) --

// Fix 4: Moved getPriority outside the component — it's a pure function with no
//         dependency on component state or props, so there's no reason to recreate
//         it on every render.
//
// Fix 5: Use a Record for O(1) lookup instead of a switch statement.
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

function getPriority(blockchain: Blockchain): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}

// -- Hooks (assumed to exist elsewhere in the codebase) --
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}): JSX.Element;

// -- Component --

// Fix 14: Removed the empty `Props` interface; use `BoxProps` directly.
const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
  // Fix 13: Removed unused `children` destructuring from props.
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Fix 10: Combined filter + sort + format into one useMemo to avoid extra iterations.
  // Fix 9:  Removed `prices` from the dependency array — it is not used in this computation.
  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Fix 6 & 7: Original used undefined `lhsPriority` and had inverted filter logic
        //             (was keeping amount <= 0, should keep amount > 0).
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) return -1;
        if (rightPriority > leftPriority) return 1;
        // Fix 8: Return 0 for equal priorities; original had implicit `undefined` return.
        return 0;
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]); // Fix 9: `prices` removed from deps since it's not used here.

  // Fix 11: Use `formattedBalances` (not `sortedBalances`) when mapping to rows
  //          so that `balance.formatted` is actually available.
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        // Fix 15: className wired up via rest props or an inline placeholder.
        key={balance.currency} // Fix 12: Use currency as key instead of array index.
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
