import TransactionForm from '@/components/TransactionForm'

export default function NewTransactionPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Nova Transação</h1>
        <p className="text-gray-500 text-sm mt-1">Registre uma entrada ou saída financeira</p>
      </div>
      <TransactionForm />
    </div>
  )
}
