import { Token, ValidationError } from '../types';

export function validateSwap(
  fromToken: Token | null,
  toToken: Token | null,
  fromAmount: string,
  walletBalance: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!fromToken) {
    errors.push({ field: 'fromToken', message: 'Select a token to swap from' });
  }
  if (!toToken) {
    errors.push({ field: 'toToken', message: 'Select a token to receive' });
  }
  if (fromToken && toToken && fromToken.currency === toToken.currency) {
    errors.push({ field: 'general', message: 'Cannot swap the same token' });
  }

  const amount = parseFloat(fromAmount);
  if (!fromAmount || isNaN(amount)) {
    errors.push({ field: 'fromAmount', message: 'Enter an amount' });
  } else if (amount <= 0) {
    errors.push({ field: 'fromAmount', message: 'Amount must be greater than 0' });
  } else if (amount < 0.000001) {
    errors.push({ field: 'fromAmount', message: 'Amount is too small (min 0.000001)' });
  } else if (amount > 999999999) {
    errors.push({ field: 'fromAmount', message: 'Amount exceeds maximum' });
  } else if (amount > walletBalance) {
    errors.push({ field: 'fromAmount', message: 'Insufficient balance' });
  }

  return errors;
}
