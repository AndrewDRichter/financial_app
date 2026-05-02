import type { Transaction } from '@/types'
import { formatCurrency } from '@/lib/currency'

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: (id: string) => void
}

export default function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === 'income'

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${isIncome ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <div className="min-w-0">
          <p className="text-gray-900 text-sm font-medium truncate">
            {transaction.categories?.name ?? 'Sem categoria'}
          </p>
          {transaction.description && (
            <p className="text-gray-400 text-xs mt-0.5 truncate">{transaction.description}</p>
          )}
          <p className="text-gray-400 text-xs mt-0.5">
            {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <div className="text-right">
          <p className={`font-semibold text-sm ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '−'} {formatCurrency(transaction.amount, transaction.currency)}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {isIncome ? 'Entrada' : 'Saída'}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
