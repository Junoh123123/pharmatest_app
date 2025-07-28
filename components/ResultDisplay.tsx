'use client'

import { QuestionResult } from '@/types/exam'

interface ResultDisplayProps {
  result: QuestionResult
  onNext: () => void
  isLastQuestion: boolean
}

export function ResultDisplay({ result, onNext, isLastQuestion }: ResultDisplayProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="
        bg-white/80 backdrop-blur-xl rounded-3xl 
        border border-gray-200/50 shadow-xl
        p-8 mb-8
      ">
        {/* 結果ヘッダー */}
        <div className="text-center mb-8">
          <div className={`
            inline-flex items-center justify-center
            w-16 h-16 rounded-full mb-4
            ${result.isCorrect 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
            }
          `}>
            {result.isCorrect ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className={`
            text-2xl font-bold mb-2
            ${result.isCorrect ? 'text-green-600' : 'text-red-600'}
          `}>
            {result.isCorrect ? '正解！' : '不正解'}
          </h2>
          
          <p className="text-gray-600">
            {result.score} / {result.maxScore} 点
          </p>
        </div>

        {/* 回答詳細 */}
        <div className="space-y-6 mb-8">
          {result.correctAnswers.map((correctAnswer, index) => {
            const userAnswer = result.userAnswers[index] || ''
            const normalizedUserAnswer = userAnswer.toLowerCase().trim()
            const possibleAnswers = correctAnswer.split('|').map(ans => ans.toLowerCase().trim())
            const isCorrect = possibleAnswers.includes(normalizedUserAnswer)

            return (
              <div key={index} className="
                p-4 rounded-2xl border
                ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
              ">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    空欄 {index + 1}
                  </span>
                  <div className={`
                    inline-flex items-center justify-center
                    w-6 h-6 rounded-full text-xs font-medium
                    ${isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                    }
                  `}>
                    {isCorrect ? '○' : '×'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 w-16">あなた:</span>
                    <span className={`
                      font-medium
                      ${isCorrect ? 'text-green-700' : 'text-red-700'}
                    `}>
                      {userAnswer || '（未回答）'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 w-16">正解:</span>
                      <span className="font-medium text-green-700">
                        {correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 次へボタン */}
        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="
              px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl
              hover:bg-blue-600 active:bg-blue-700
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-4 focus:ring-blue-100
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg hover:shadow-xl
            "
          >
            {isLastQuestion ? '結果を見る' : '次の問題へ'}
          </button>
        </div>
      </div>
    </div>
  )
} 