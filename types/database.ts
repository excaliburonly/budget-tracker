export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  date: string; // This will now include time information
  category_id?: string | null;
  investment_id?: string | null;
  account_id?: string | null;
  to_account_id?: string | null;
  notes?: string | null;
  type: 'income' | 'expense' | 'transfer' | 'investment';
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
  subscription_tier?: 'free' | 'premium';
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalAllocation {
  id: string;
  goal_id: string;
  asset_type: 'account' | 'investment';
  asset_id: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  asset_name: string;
  investment_type: string;
  symbol: string | null;
  quantity: number;
  average_buy_price: number;
  invested_value: number;
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
  // Relation fields
  investments?: {
    asset_name: string;
    investment_type: string;
  } | null;
  transactions?: {
    notes: string | null;
    accounts: {
      name: string;
    } | null;
  } | null;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  account_category: 'normal' | 'debt';
  balance: number;
  created_at: string;
  updated_at: string;
}
