// 파일 위치: app/[subject]/[category]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { UserAnswer, QuestionResult, ExamSession, Category } from '@/types/exam'
import { QuestionCard } from '@/components/QuestionCard'
import { ResultDisplay } from '@/components/ResultDisplay'
import { FinalResults } from '@/components/FinalResults'
import { scoreQuestion } from '@/lib/scoring'

export default function CategoryPage() {
  const params = useParams()
  const subjectId = params.subject as string
  const categoryId = params.category as string

  const [category, setCategory] = useState<Category | null>(null)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true)
      const minLoadingTime = 300;
      const startTime = Date.now();

      try {
        const fetchPromise = fetch(`/api/categories/${categoryId}`).then(res => {
          if (!res.ok) {
            throw new Error(`カテゴリが見つかりません (${res.status})`);
          }
          return res.json();
        });

        const delayPromise = new Promise(resolve => setTimeout(resolve, minLoadingTime));
        const [categoryData] = await Promise.all([fetchPromise, delayPromise]);

        setCategory(categoryData)
        initializeSession(categoryData)
      } catch (err) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minLoadingTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
        }
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
      isCompleted: false,
    }
    setSession(newSession)
  }

  const handleAnswersChange = (answers: UserAnswer[]) => {
    if (!session) return
    setSession({ ...session, answers: answers })
  }

  const handleSubmit = () => {
    if (!session || !category) return
    const currentQuestion = category.questions[session.currentQuestionIndex]
    const result = scoreQuestion(currentQuestion, session.answers)
    setCurrentResult(result)
    setSession({ ...session, results: [...session.results, result] })
  }

  const handleNext = () => {
    if (!session || !category) return
    const nextIndex = session.currentQuestionIndex + 1
    if (nextIndex >= category.questions.length) {
      setSession({ ...session, isCompleted: true })
      setCurrentResult(null)
    } else {
      setSession({ ...session, currentQuestionIndex: nextIndex })
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
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">エラー</h2>
          <p className="mb-8">{error}</p>
          <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded-lg">
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link
              href={`/${subjectId}`}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {/* 👇 ?.을 사용하여 category가 null일 때를 대비하고, .trim()을 추가 */}
              {category?.name.trim()}
            </h1>
          </div>
        </div>

        {session.isCompleted ? (
          //  👇 여기에 subjectId={subjectId}를 추가한다.
          <FinalResults results={session.results} categoryName={category?.name.trim()} onRestart={handleRestart} subjectId={subjectId}  />
        ) : currentResult ? (
          <ResultDisplay result={currentResult} onNext={handleNext} isLastQuestion={session.currentQuestionIndex === category.questions.length - 1} />
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