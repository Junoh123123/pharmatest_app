'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { UserAnswer, QuestionResult, ExamSession, Category } from '@/types/exam'
import { QuestionCard } from '@/components/QuestionCard'
import { ResultDisplay } from '@/components/ResultDisplay'
import { FinalResults } from '@/components/FinalResults'
import { scoreQuestion } from '@/lib/scoring'

// このコンポーネントは実際にはクライアントコンポーネントなので、
// サーバーサイドでのデータ取得は別途実装する必要があります
export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string

  const [category, setCategory] = useState<Category | null>(null)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // カテゴリデータの取得
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/categories/${categoryId}`)
        
        if (!response.ok) {
          throw new Error('カテゴリが見つかりません')
        }

        const categoryData = await response.json()
        setCategory(categoryData)

        // セッションの初期化
        initializeSession(categoryData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (categoryId) {
      fetchCategoryData()
    }
  }, [categoryId])

  const initializeSession = (categoryData: Category) => {
    const newSession: ExamSession = {
      categoryId: categoryData.id,
      currentQuestionIndex: 0,
      answers: [],
      results: [],
      startTime: new Date(),
      isCompleted: false
    }
    setSession(newSession)
  }

  const handleAnswersChange = (answers: UserAnswer[]) => {
    if (!session) return

    setSession({
      ...session,
      answers: answers
    })
  }

  const handleSubmit = () => {
    if (!session || !category) return

    const currentQuestion = category.questions[session.currentQuestionIndex]
    const result = scoreQuestion(currentQuestion, session.answers)
    
    setCurrentResult(result)
    setSession({
      ...session,
      results: [...session.results, result]
    })
  }

  const handleNext = () => {
    if (!session || !category) return

    const nextIndex = session.currentQuestionIndex + 1
    
    if (nextIndex >= category.questions.length) {
      // 全問題完了
      setSession({
        ...session,
        isCompleted: true
      })
      setCurrentResult(null)
    } else {
      // 次の問題へ
      setSession({
        ...session,
        currentQuestionIndex: nextIndex
      })
      setCurrentResult(null)
    }
  }

  const handleRestart = () => {
    if (!category) return
    initializeSession(category)
    setCurrentResult(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">問題を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Link 
            href="/"
            className="
              inline-flex items-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl
              hover:bg-blue-600 transition-colors duration-200
            "
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link
              href="/"
              className="
                mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                rounded-full transition-all duration-200
              "
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {category.name}
            </h1>
          </div>
          <p className="text-gray-600">
            {category.description}
          </p>
        </div>

        {/* メインコンテンツ */}
        {session.isCompleted ? (
          <FinalResults
            results={session.results}
            categoryName={category.name}
            onRestart={handleRestart}
          />
        ) : currentResult ? (
          <ResultDisplay
            result={currentResult}
            onNext={handleNext}
            isLastQuestion={session.currentQuestionIndex === category.questions.length - 1}
          />
        ) : (
          <QuestionCard
            question={category.questions[session.currentQuestionIndex]}
            questionNumber={session.currentQuestionIndex + 1}
            totalQuestions={category.questions.length}
            userAnswers={session.answers}
            onAnswersChange={handleAnswersChange}
            onSubmit={handleSubmit}
            isSubmitted={false}
          />
        )}
      </div>
    </div>
  )
} 