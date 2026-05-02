import CategoryManager from '@/components/CategoryManager'

export default function CategoriesPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Categorias</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie os motivos de movimentação (mercado, salário, etc.)
        </p>
      </div>
      <CategoryManager />
    </div>
  )
}
