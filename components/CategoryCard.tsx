'use client'

import Link from 'next/link'

interface CategoryCardProps {
  id: string
  name: string
  nameEn: string
  description: string
  questionCount: number
}

export function CategoryCard({ id, name, nameEn, description, questionCount }: CategoryCardProps) {
  return (
    <Link 
      href={`/${id}`}
      className="group block w-full max-w-md mx-auto"
    >
      <div className="
        relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl
        border border-gray-200/50 shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:border-gray-300/50
        active:scale-[0.98] active:transition-none
      ">
        {/* カードコンテンツ */}
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
                {name}
              </h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {nameEn}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <div className="
                inline-flex items-center justify-center
                w-10 h-10 rounded-full
                bg-blue-100 text-blue-600
                group-hover:bg-blue-200 transition-colors duration-200
              ">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 説明文 */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {description}
          </p>

          {/* 問題数 */}
          <div className="flex items-center text-sm">
            <svg 
              className="w-4 h-4 text-gray-400 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span className="text-gray-500">
              {questionCount}問の練習問題
            </span>
          </div>
        </div>

        {/* ホバーエフェクト用のオーバーレイ */}
        <div className="
          absolute inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/50
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
          pointer-events-none
        " />
      </div>
    </Link>
  )
} 