export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  category_id?: string | null;
  emergency_fund_id?: string | null;
  investment_id?: string | null;
  account_id?: string | null;
  to_account_id?: string | null;
  notes?: string | null;
  type: 'income' | 'expense' | 'transfer';
  created_at: string;
  // Relation fields
  categories?: {
    name: string;
    color: string | null;
    icon?: string | null;
  } | null;
  accounts?: {
    name: string;
  } | null;
  to_accounts?: {
    name: string;
  } | null;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
  // Relation fields
  categories?: {
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  updated_at: string;
}

export interface EmergencyFund {
  id: string;
  user_id: string;
  name: string;
  instrument_type: string;
  institution_name: string | null;
  target_amount: number;
  current_amount: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyFundTransaction {
  id: string;
  emergency_fund_id: string;
  transaction_id: string | null;
  type: 'contribution' | 'withdrawal';
  amount: number;
  date: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  asset_name: string;
  investment_type: string;
  symbol: string | null;
  quantity: number;
  average_buy_price: number;
  current_value: number;
  last_synced_at: string | null;
  created_at: string;
}

export interface InvestmentTransaction {
  id: string;
  investment_id: string;
  transaction_id: string | null;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}
