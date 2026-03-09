export interface TokenPrice {
  currency: string;
  price: number;
}

export interface Token {
  currency: string;
  price: number;
  icon: string;
}

export interface SwapFormState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
}

export interface ValidationError {
  field: 'fromAmount' | 'toAmount' | 'fromToken' | 'toToken' | 'general';
  message: string;
}
