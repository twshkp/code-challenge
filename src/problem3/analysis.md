# Computational Inefficiencies and Anti-Patterns Analysis

## Overview

This document analyzes a React/TypeScript `WalletPage` component that retrieves wallet balances, filters and sorts them by blockchain priority, and renders a list of `WalletRow` components. The code contains several critical bugs, type errors, performance issues, and anti-patterns that would prevent it from functioning correctly in production.

---

## Issues Found

### Issue 1: `lhsPriority` is undefined

**Category**: Bug
**Severity**: Critical
**Location**: Inside the `useMemo` filter callback:
```tsx
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {
```
**Problem**: The variable `balancePriority` is assigned but never read. Instead, the condition references `lhsPriority`, which is never declared in this scope. `lhsPriority` appears to be a leftover from an earlier draft where the filter and sort logic may have shared variable names. At runtime, this produces a `ReferenceError: lhsPriority is not defined`, crashing the component.

**Impact**: The entire component is non-functional. The `useMemo` computation throws on every render, meaning no wallet rows are ever displayed.

**Fix**: Replace `lhsPriority` with `balancePriority`:
```tsx
const balancePriority = getPriority(balance.blockchain);
if (balancePriority > -99) {
```

---

### Issue 2: Filter logic is inverted

**Category**: Bug
**Severity**: Critical
**Location**: Inside the `useMemo` filter callback:
```tsx
if (balancePriority > -99) {
   if (balance.amount <= 0) {
     return true;
   }
}
return false;
```
**Problem**: The filter keeps balances where the amount is less than or equal to zero and discards balances with positive amounts. This is the opposite of the intended behavior. A wallet page should display balances that (a) belong to a recognized blockchain (priority > -99) and (b) have a positive amount worth showing.

**Impact**: Even if Issue 1 were fixed, the component would only display empty or zero-balance wallets, hiding all wallets that actually contain funds. This is a fundamental logic error that completely breaks the feature's purpose.

**Fix**: Invert the amount condition to keep positive balances:
```tsx
if (balancePriority > -99) {
   if (balance.amount > 0) {
     return true;
   }
}
return false;
```
Or more concisely:
```tsx
return balancePriority > -99 && balance.amount > 0;
```

---

### Issue 3: `blockchain` property missing from `WalletBalance` type

**Category**: Type Error
**Severity**: Critical
**Location**: The `WalletBalance` interface and its usage in `getPriority(balance.blockchain)`:
```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
```
**Problem**: The code accesses `balance.blockchain` in both the filter and sort callbacks, but the `WalletBalance` interface only declares `currency` and `amount`. TypeScript should flag this as a compile-time error: `Property 'blockchain' does not exist on type 'WalletBalance'`.

**Impact**: Without the `blockchain` property in the type definition, TypeScript cannot validate that the data actually contains this field. If the runtime data also lacks it, `getPriority` receives `undefined`, which matches no switch case and always returns `-99`, filtering out all balances.

**Fix**: Add the `blockchain` property to the interface:
```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // ideally a union type like Blockchain
}
```

---

### Issue 4: `rows` maps over `sortedBalances` instead of `formattedBalances`

**Category**: Bug
**Severity**: Critical
**Location**:
```tsx
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})

const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
```
**Problem**: `formattedBalances` is computed by mapping over `sortedBalances` and adding a `formatted` field, but the result is never used. The `rows` variable maps over `sortedBalances` (which has type `WalletBalance[]`, lacking the `formatted` property) while the callback parameter is typed as `FormattedWalletBalance`. This means `balance.formatted` is `undefined` at runtime, and `formattedAmount` passed to `WalletRow` will be `undefined`.

**Impact**: Every `WalletRow` receives `undefined` for its `formattedAmount` prop, resulting in missing or broken display of formatted amounts. The `formattedBalances` computation is entirely wasted work.

**Fix**: Map `rows` over `formattedBalances` instead of `sortedBalances`:
```tsx
const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
```

---

### Issue 5: `getPriority` uses `any` type

**Category**: Type Error
**Severity**: Medium
**Location**:
```tsx
const getPriority = (blockchain: any): number => {
```
**Problem**: The `blockchain` parameter is typed as `any`, which completely disables TypeScript's type checking for this argument. Any value can be passed without error, including numbers, objects, or `null`. This defeats the purpose of using TypeScript and masks potential bugs where an incorrect value type is passed.

**Impact**: Bugs where a non-string or misspelled blockchain name is passed to `getPriority` will not be caught at compile time, only failing silently at runtime by returning `-99`.

**Fix**: Define a string union type and use it:
```tsx
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

const getPriority = (blockchain: Blockchain): number => {
```
If the function must also handle unknown strings gracefully, use `string` as the type, which is still far better than `any`.

---

### Issue 6: `FormattedWalletBalance` duplicates fields instead of extending `WalletBalance`

**Category**: Type Error
**Severity**: Low
**Location**:
```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}
```
**Problem**: `FormattedWalletBalance` manually re-declares `currency` and `amount` instead of extending `WalletBalance`. This creates a maintenance burden: if a field is added to or changed in `WalletBalance`, the change must be manually duplicated in `FormattedWalletBalance`, or the two types will silently drift apart.

**Impact**: Increases risk of type inconsistency during future modifications. Violates the DRY (Don't Repeat Yourself) principle.

**Fix**: Use interface extension:
```tsx
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
```

---

### Issue 7: Empty `Props` interface

**Category**: Code Quality
**Severity**: Low
**Location**:
```tsx
interface Props extends BoxProps {

}
```
**Problem**: The `Props` interface extends `BoxProps` but adds no additional properties. This is an unnecessary layer of indirection. It creates the false impression that the component has custom props beyond what `BoxProps` provides, and adds noise to the code.

**Impact**: Minor readability issue. Adds unnecessary abstraction with no benefit.

**Fix**: Use `BoxProps` directly:
```tsx
const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
```
Or, if a custom `Props` type is desired for future extensibility, at minimum add a comment explaining that intent.

---

### Issue 8: `getPriority` is recreated on every render

**Category**: Performance
**Severity**: Medium
**Location**:
```tsx
const WalletPage: React.FC<Props> = (props: Props) => {
  // ...
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      // ...
    }
  }
```
**Problem**: `getPriority` is defined inside the component body, so a new function instance is created on every render. This is wasteful because the function is a pure computation with no dependencies on component state, props, or hooks.

**Impact**: While the performance cost of creating a single function per render is small in isolation, it also means `getPriority` should technically be listed as a dependency of `useMemo` (ESLint's `react-hooks/exhaustive-deps` rule would flag this). Since the function is recreated each render, including it as a dependency would invalidate the memo every time, defeating its purpose.

**Fix**: Move `getPriority` outside the component since it is a pure function:
```tsx
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis': return 100;
    case 'Ethereum': return 50;
    case 'Arbitrum': return 30;
    case 'Zilliqa': return 20;
    case 'Neo': return 20;
    default: return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  // ...
```

---

### Issue 9: `prices` in `useMemo` dependency array but not used inside

**Category**: Performance
**Severity**: Medium
**Location**:
```tsx
const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    // ... no reference to prices ...
  }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
    // ... no reference to prices ...
  });
}, [balances, prices]);
```
**Problem**: The `prices` variable is listed as a dependency of the `useMemo` hook, but is never referenced inside the memoized computation. The filtering and sorting logic depends only on `balances` and `getPriority`. Including `prices` causes the entire filter-and-sort operation to re-run whenever prices update, even though the result would be identical.

**Impact**: Unnecessary recomputation of the sorted balances array every time price data changes. In a real-time application where prices update frequently (e.g., cryptocurrency prices), this could trigger many redundant computations and downstream re-renders.

**Fix**: Remove `prices` from the dependency array:
```tsx
}, [balances]);
```

---

### Issue 10: `formattedBalances` is not memoized

**Category**: Performance
**Severity**: Medium
**Location**:
```tsx
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})
```
**Problem**: `formattedBalances` is computed on every render without `useMemo`. Even when `sortedBalances` has not changed, this `.map()` call runs again, creating new objects each time. This also causes all child `WalletRow` components to receive new prop objects, preventing `React.memo` optimizations.

**Impact**: Redundant computation and object allocation on every render. Can trigger unnecessary re-renders of child components.

**Fix**: Either wrap in `useMemo` or combine the formatting into the existing `sortedBalances` memo:
```tsx
const formattedBalances = useMemo(() => {
  return sortedBalances.map((balance: WalletBalance) => ({
    ...balance,
    formatted: balance.amount.toFixed(),
  }));
}, [sortedBalances]);
```

---

### Issue 11: Sort comparator does not return 0 for equal priorities

**Category**: Performance
**Severity**: Medium
**Location**:
```tsx
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    if (leftPriority > rightPriority) {
      return -1;
    } else if (rightPriority > leftPriority) {
      return 1;
    }
});
```
**Problem**: When `leftPriority === rightPriority`, the comparator falls through without an explicit `return 0`. The function implicitly returns `undefined`, which JavaScript coerces to `0`. While this happens to produce the correct behavior in most engines, the ECMAScript specification requires comparators to return a number, and relying on `undefined` coercion is technically non-compliant. Some engines may produce unstable or inconsistent sort results.

**Impact**: Potentially inconsistent sort ordering across different JavaScript engines or browser versions. Code is unclear about its intent for the equal case.

**Fix**: Add an explicit return for the equal case:
```tsx
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
return 0;
```

---

### Issue 12: `getPriority` is called multiple times per balance

**Category**: Performance
**Severity**: Low
**Location**: `getPriority` is called once per element in `filter`, then again twice per comparison in `sort`.

**Problem**: For each balance, `getPriority` is called during the filter pass. Then during the sort pass, it is called again for both elements in each comparison. For a list of `n` balances, filtering calls `getPriority` `n` times, and sorting calls it up to `O(n log n)` times (twice per comparison). The priority values are deterministic and could be computed once per element.

**Impact**: Redundant computation. While the switch statement is cheap, the principle of computing derived values once matters at scale and is a recognized anti-pattern.

**Fix**: Compute priorities once upfront, then filter and sort using the cached values:
```tsx
const balancesWithPriority = balances.map(balance => ({
  ...balance,
  priority: getPriority(balance.blockchain),
}));
const sortedBalances = balancesWithPriority
  .filter(b => b.priority > -99 && b.amount > 0)
  .sort((a, b) => b.priority - a.priority);
```

---

### Issue 13: Using array index as React `key`

**Category**: Anti-Pattern
**Severity**: High
**Location**:
```tsx
<WalletRow
  key={index}
```
**Problem**: Using the array index as a React `key` is a well-documented anti-pattern. If the list is reordered, filtered, or items are added/removed, React uses the key to determine which components to re-render, unmount, or reuse. Index-based keys cause React to misidentify elements after list mutations, leading to incorrect DOM updates, stale state in child components, and visual glitches.

**Impact**: If the user's wallet balances change order (e.g., due to re-sorting by priority after a balance update), React may incorrectly reuse component state from one wallet row for a different wallet, causing displayed data to mismatch or animations to break.

**Fix**: Use a stable, unique identifier as the key:
```tsx
<WalletRow
  key={balance.currency}
```

---

### Issue 14: `children` destructured but never used

**Category**: Anti-Pattern
**Severity**: Low
**Location**:
```tsx
const { children, ...rest } = props;
```
**Problem**: The `children` prop is destructured from `props` but is never rendered or referenced anywhere in the component. Since `Props` extends `BoxProps`, the component accepts `children` as a valid prop, but silently discards it.

**Impact**: If a consumer passes children to `WalletPage`, they are silently ignored, which is misleading. The unused variable also triggers linter warnings. If `children` should not be rendered, it should not be part of the props type. If it should be rendered, it needs to be included in the JSX output.

**Fix**: Either render the children:
```tsx
return (
  <div {...rest}>
    {rows}
    {children}
  </div>
)
```
Or remove the destructuring if children are intentionally excluded:
```tsx
const { ...rest } = props;
```

---

### Issue 15: Inconsistent indentation

**Category**: Code Quality
**Severity**: Low
**Location**: Throughout the component, particularly:
- `getPriority` is indented with an extra leading space relative to other declarations.
- The filter callback uses 6-space and 10-space indentation inconsistently.
- The sort callback mixes 4-space and 10-space indentation.

**Problem**: The code has no consistent indentation style. Some blocks use 2 spaces, others 4, and some appear to use 6 or 10 spaces. This inconsistency makes the code significantly harder to read and review, and suggests the code was assembled from different sources without reformatting.

**Impact**: Reduced readability and maintainability. Makes code review harder and increases the likelihood of logic errors being missed.

**Fix**: Apply a consistent indentation style (2 spaces is the common React/TypeScript convention) and enforce it with a formatter like Prettier:
```json
{
  "tabWidth": 2,
  "useTabs": false
}
```

---

### Issue 16: `classes.row` referenced but never defined

**Category**: Bug
**Severity**: High
**Location**:
```tsx
className={classes.row}
```
**Problem**: The `classes` object is never imported, declared, or created anywhere in the component. This is typically a reference to a CSS-in-JS styling solution (such as Material-UI's `makeStyles` or `useStyles`), but the corresponding hook call or import is completely missing. At runtime, this produces a `ReferenceError: classes is not defined`.

**Impact**: The component crashes at render time. Even if all other bugs were fixed, this missing reference would prevent any rows from displaying.

**Fix**: Either define the styles using the appropriate styling solution:
```tsx
const useStyles = makeStyles({
  row: {
    // styles here
  }
});

// Inside component:
const classes = useStyles();
```
Or use a plain CSS class string if external stylesheets are used:
```tsx
className="row"
```

---

## Summary

| Severity | Count | Issues |
|----------|-------|--------|
| Critical | 4 | #1 (undefined variable), #2 (inverted filter), #3 (missing type property), #4 (unused formattedBalances) |
| High | 2 | #13 (index as key), #16 (undefined classes) |
| Medium | 5 | #5 (any type), #8 (function recreation), #9 (wrong dependencies), #10 (missing memo), #11 (sort comparator) |
| Low | 5 | #6 (type duplication), #7 (empty interface), #12 (redundant calls), #14 (unused children), #15 (indentation) |

The code has **4 critical bugs** that prevent it from functioning at all, **2 high-severity issues** that would cause runtime errors or rendering defects, and **10 additional issues** spanning type safety, performance, and code quality. The component in its current form would not compile under strict TypeScript settings and would crash at runtime even without strict mode enabled.
