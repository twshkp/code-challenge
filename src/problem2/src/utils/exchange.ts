import { Token } from '../types';

export function calculateExchangeRate(fromToken: Token, toToken: Token): number {
  // Convert through USD: fromToken.price / toToken.price
  return fromToken.price / toToken.price;
}

export function calculateOutputAmount(inputAmount: string, fromToken: Token, toToken: Token): string {
  const amount = parseFloat(inputAmount);
  if (isNaN(amount) || amount <= 0) return '';
  const rate = calculateExchangeRate(fromToken, toToken);
  const output = amount * rate;
  // Show up to 6 decimal places, remove trailing zeros
  return parseFloat(output.toFixed(6)).toString();
}

export function calculateInputAmount(outputAmount: string, fromToken: Token, toToken: Token): string {
  const amount = parseFloat(outputAmount);
  if (isNaN(amount) || amount <= 0) return '';
  const rate = calculateExchangeRate(toToken, fromToken);
  const output = amount * rate;
  return parseFloat(output.toFixed(6)).toString();
}

export function formatRate(fromToken: Token, toToken: Token): string {
  const rate = calculateExchangeRate(fromToken, toToken);
  return `1 ${fromToken.currency} ≈ ${parseFloat(rate.toFixed(6))} ${toToken.currency}`;
}

export function formatConfirmedRate(fromToken: Token, toToken: Token): string {
  const rate = calculateExchangeRate(fromToken, toToken);
  return `1 ${fromToken.currency} = ${parseFloat(rate.toFixed(6))} ${toToken.currency}`;
}
