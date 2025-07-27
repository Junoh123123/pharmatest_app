// app/[subject]/page.tsx

import { CategoryCard } from '@/components/CategoryCard'
import { getSubjectData, getAllSubjects } from '@/lib/examLoader'
import Link from 'next/link'

export async function generateStaticParams() {
  const subjects = await getAllSubjects();
  return subjects.map((subject) => ({
    subject: subject.id,
  }));
}

export default async function SubjectPage({ params }: { params: { subject: string } }) {
  const { subject: subjectId } = await params;
    const subject = await getSubjectData(subjectId)

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">科目が見つかりません</h2>
          <p className="mb-8">指定された科目は存在しませんでした。</p>
          <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Link
              href="/"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              {subject.name.trim()}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {subject.description.trim()}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {subject.categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={`${subject.id}/${category.id}`}
              name={category.name.trim()}
              nameEn={category.nameEn.trim()}
              description={category.description.trim()}
              questionCount={category.questionCount}
            />
          ))}
        </div>
      </div>
    </div>
  )
}