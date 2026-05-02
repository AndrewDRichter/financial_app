export type TransactionType = 'income' | 'expense'
export type Currency = 'PYG' | 'USD'
export type CategoryType = 'income' | 'expense' | 'both'

export interface Category {
  id: string
  name: string
  type: CategoryType
  created_at: string
}

export interface Transaction {
  id: string
  type: TransactionType
  category_id: string | null
  categories: Category | null
  amount: number
  currency: Currency
  description: string | null
  created_at: string
}
