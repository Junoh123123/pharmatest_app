// app/page.tsx

import { getAllSubjects } from '@/lib/examLoader'
import { siteConfig } from '@/lib/siteConfig' // 👈 공통 설정 파일 불러오기
import Link from 'next/link'

export default async function HomePage() {
  const subjects = await getAllSubjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {/* 👇 공통 설정 파일의 변수를 사용하도록 수정 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {siteConfig.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/${subject.id}`} className="
              block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl 
              transition-all duration-300 transform hover:-translate-y-2
              border border-gray-100
            ">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{subject.name}</h2>
              <p className="text-gray-600 mb-4">{subject.description}</p>
              <div className="text-right font-semibold text-blue-600">
                全 {subject.categoryCount} 章
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}