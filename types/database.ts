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
  categories?: {
    name: string;
    color: string | null;
  } | null;
}
