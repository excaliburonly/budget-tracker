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
  notes?: string | null;
  type: 'income' | 'expense';
  created_at: string;
  // Relation fields
  categories?: {
    name: string;
    color: string | null;
    icon?: string | null;
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
