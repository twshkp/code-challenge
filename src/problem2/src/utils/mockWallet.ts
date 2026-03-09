import { Token } from '../types';

// Generate random balances for demo purposes
const balances: Record<string, number> = {};

export function getBalance(token: Token): number {
  if (!balances[token.currency]) {
    // Generate a random balance between 0.1 and 10000 based on token price
    // Higher priced tokens get lower balances for realism
    const baseAmount = 10000 / token.price;
    balances[token.currency] = parseFloat((Math.random() * baseAmount + 0.1).toFixed(4));
  }
  return balances[token.currency];
}

export function formatBalance(balance: number): string {
  if (balance >= 1000) return balance.toFixed(2);
  if (balance >= 1) return balance.toFixed(4);
  return balance.toFixed(6);
}
