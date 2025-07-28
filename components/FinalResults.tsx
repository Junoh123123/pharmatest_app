'use client'

import Link from 'next/link'
import { QuestionResult } from '@/types/exam'
import { calculateSessionScore } from '@/lib/scoring'

interface FinalResultsProps {
  results: QuestionResult[]
  categoryName: string
  onRestart: () => void
  subjectId: string 
}

export function FinalResults({ results, categoryName, onRestart, subjectId }: FinalResultsProps) {
  const sessionScore = calculateSessionScore(results)
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return '素晴らしい成績です！'
    if (percentage >= 80) return 'とても良い成績です！'
    if (percentage >= 70) return '良い成績です！'
    if (percentage >= 60) return '合格ラインです。'
    return 'もう一度挑戦してみましょう。'
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="
        bg-white/80 backdrop-blur-xl rounded-3xl 
        border border-gray-200/50 shadow-xl
        p-8 mb-8
      ">
        {/* 結果ヘッダー */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              お疲れさまでした！
            </h1>
            <p className="text-gray-600">
              {categoryName}の練習が完了しました
            </p>
          </div>

          {/* スコア表示 */}
          <div className="
            inline-flex flex-col items-center justify-center
            w-32 h-32 rounded-full mb-6
            bg-gradient-to-br from-blue-50 to-blue-100
            border-4 border-blue-200
          ">
            <span className={`text-4xl font-bold ${getScoreColor(sessionScore.percentage)}`}>
              {sessionScore.percentage}%
            </span>
            <span className="text-sm text-gray-500">
              スコア
            </span>
          </div>

          <p className={`text-lg font-medium mb-6 ${getScoreColor(sessionScore.percentage)}`}>
            {getScoreMessage(sessionScore.percentage)}
          </p>
        </div>

        {/* 詳細スコア */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sessionScore.correctQuestions}
            </div>
            <div className="text-sm text-gray-500">
              正解問題数
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sessionScore.totalQuestions}
            </div>
            <div className="text-sm text-gray-500">
              総問題数
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sessionScore.totalScore}
            </div>
            <div className="text-sm text-gray-500">
              獲得点数
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {sessionScore.totalMaxScore}
            </div>
            <div className="text-sm text-gray-500">
              満点
            </div>
          </div>
        </div>

        {/* 問題別結果 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            問題別結果
          </h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={result.questionId} className="
                flex items-center justify-between
                p-3 rounded-xl border border-gray-200
                hover:bg-gray-50 transition-colors duration-200
              ">
                <span className="text-sm text-gray-600">
                  問題 {index + 1}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {result.score} / {result.maxScore}
                  </span>
                  <div className={`
                    inline-flex items-center justify-center
                    w-6 h-6 rounded-full text-xs font-medium
                    ${result.isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                    }
                  `}>
                    {result.isCorrect ? '○' : '×'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="
              px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl
              hover:bg-blue-600 active:bg-blue-700
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-blue-100
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl
            "
          >
            もう一度挑戦
          </button>
          
          <Link 
            href={`/${subjectId}`}
            className="
              px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl
              hover:bg-gray-200 active:bg-gray-300
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-gray-100
              transform hover:scale-[1.02] active:scale-[0.98]
              text-center
            "
          >
            カテゴリ選択に戻る
          </Link>
        </div>
      </div>
    </div>
  )
} 