interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  variant?: 'default' | 'income' | 'expense'
}

export default function StatsCard({ title, value, subtitle, variant = 'default' }: StatsCardProps) {
  const wrapperStyles = {
    default: 'border-gray-200 bg-white',
    income: 'border-emerald-200 bg-emerald-50',
    expense: 'border-red-200 bg-red-50',
  }
  const valueStyles = {
    default: 'text-gray-900',
    income: 'text-emerald-700',
    expense: 'text-red-700',
  }

  return (
    <div className={`rounded-lg border p-5 ${wrapperStyles[variant]}`}>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-2xl font-semibold mt-1 truncate ${valueStyles[variant]}`}>{value}</p>
      {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
