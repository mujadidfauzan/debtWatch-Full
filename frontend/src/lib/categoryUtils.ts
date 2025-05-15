// lib/categoryUtils.ts

export type TransactionType = 'income' | 'expense';

export interface Category {
  label: string;
  type: TransactionType;
  icon: string;
}

export const categories: Category[] = [
  // Income Categories
  { label: 'Salary', type: 'income', icon: '💰' },
  { label: 'Freelance', type: 'income', icon: '🧑‍💻' },
  { label: 'Investment', type: 'income', icon: '📈' },
  { label: 'Gift', type: 'income', icon: '🎁' },
  { label: 'Bonus', type: 'income', icon: '💎' },
  { label: 'Rental Income', type: 'income', icon: '🏠' },
  { label: 'Reimbursement', type: 'income', icon: '📄' },
  { label: 'Refund', type: 'income', icon: '💳' },
  { label: 'Other', type: 'income', icon: '📋' },

  // Expense Categories
  { label: 'Food', type: 'expense', icon: '🍴' },
  { label: 'Groceries', type: 'expense', icon: '🛒' },
  { label: 'Transport', type: 'expense', icon: '🚗' },
  { label: 'Fuel', type: 'expense', icon: '⛽' },
  { label: 'Utilities', type: 'expense', icon: '💡' },
  { label: 'Rent', type: 'expense', icon: '🏡' },
  { label: 'Mortgage', type: 'expense', icon: '🏦' },
  { label: 'Internet', type: 'expense', icon: '🌐' },
  { label: 'Entertainment', type: 'expense', icon: '🎬' },
  { label: 'Shopping', type: 'expense', icon: '🛍️' },
  { label: 'Healthcare', type: 'expense', icon: '⚕️' },
  { label: 'Insurance', type: 'expense', icon: '🛡️' },
  { label: 'Education', type: 'expense', icon: '🎓' },
  { label: 'Phone Bill', type: 'expense', icon: '📱' },
  { label: 'Travel', type: 'expense', icon: '✈️' },
  { label: 'Childcare', type: 'expense', icon: '🧸' },
  { label: 'Pets', type: 'expense', icon: '🐾' },
  { label: 'Donations', type: 'expense', icon: '🙏' },
  { label: 'Subscriptions', type: 'expense', icon: '📦' },
  { label: 'Other', type: 'expense', icon: '📋' },
];

// Get categories by type
export const getCategoriesByType = (type: TransactionType): string[] => {
  return categories.filter((c) => c.type === type).map((c) => c.label);
};

// Get icon for a given category label
export const getCategoryIcon = (label: string): string => {
  return categories.find((c) => c.label === label)?.icon || '📋';
};
