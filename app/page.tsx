import { CategoryCard } from '@/components/CategoryCard'
import { getAllCategories } from '@/lib/examLoader'

export default async function HomePage() {
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            薬学部定期試験学習アプリ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            定期試験の重要概念を虫食い問題で効率的に学習できます。<br />
            カテゴリを選んで、一問一答形式で知識を確認しましょう。
          </p>
        </div>

        {/* カテゴリ一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              name={category.name}
              nameEn={category.nameEn}
              description={category.description}
              questionCount={category.questionCount}
            />
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>
            問題を解いて、各科目の理解を深めましょう
          </p>
        </div>
      </div>
    </div>
  )
}
