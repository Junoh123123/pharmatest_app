'use client'

import { useState, useCallback } from 'react'
import { Question, UserAnswer } from '@/types/exam'
import { splitQuestionForInputs } from '@/lib/scoring'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  userAnswers: UserAnswer[]
  onAnswersChange: (answers: UserAnswer[]) => void
  onSubmit: () => void
  isSubmitted: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  userAnswers,
  onAnswersChange,
  onSubmit,
  isSubmitted
}: QuestionCardProps) {
  const [answers, setAnswers] = useState<{ [blankId: string]: string }>(() => {
    const initialAnswers: { [blankId: string]: string } = {}
    userAnswers.forEach(answer => {
      if (answer.questionId === question.id) {
        initialAnswers[answer.blankId] = answer.answer
      }
    })
    return initialAnswers
  })

  const questionParts = splitQuestionForInputs(question.text)

  const handleInputChange = useCallback((blankId: string, value: string) => {
    const newAnswers = { ...answers, [blankId]: value }
    setAnswers(newAnswers)

    // UserAnswer配列を更新
    const updatedUserAnswers = userAnswers.filter(
      answer => answer.questionId !== question.id
    )
    
    question.blanks.forEach(blank => {
      if (newAnswers[blank.id]) {
        updatedUserAnswers.push({
          questionId: question.id,
          blankId: blank.id,
          answer: newAnswers[blank.id]
        })
      }
    })

    onAnswersChange(updatedUserAnswers)
  }, [answers, userAnswers, question, onAnswersChange])

  const allAnswersFilled = question.blanks.every(blank => 
    answers[blank.id]?.trim().length > 0
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            問題 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="
        bg-white/80 backdrop-blur-xl rounded-3xl 
        border border-gray-200/50 shadow-xl
        p-8 mb-8
      ">
        {/* 問題文 */}
        <div className="text-lg leading-relaxed text-gray-800 mb-8">
          {questionParts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <span key={index} className="whitespace-pre-wrap">
                  {part.content}
                </span>
              )
            } else {
              const blank = question.blanks[part.blankIndex!]
              return (
                <span key={index} className="inline-block">
                  <input
                    type="text"
                    value={answers[blank.id] || ''}
                    onChange={(e) => handleInputChange(blank.id, e.target.value)}
                    disabled={isSubmitted}
                    placeholder={blank.placeholder}
                    className="
                      inline-block min-w-[120px] w-auto px-3 py-2 mx-1
                      text-center font-medium text-gray-900
                      bg-blue-50/50 border-2 border-blue-200
                      rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100
                      focus:border-blue-400 transition-all duration-200
                      disabled:bg-gray-100 disabled:border-gray-300
                      disabled:text-gray-600
                    "
                    style={{
                      width: `${Math.max(120, (answers[blank.id]?.length || 0) * 12 + 60)}px`
                    }}
                  />
                </span>
              )
            }
          })}
        </div>

        {/* 回答ボタン */}
        {!isSubmitted && (
          <div className="flex justify-center">
            <button
              onClick={onSubmit}
              disabled={!allAnswersFilled}
              className="
                px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl
                hover:bg-blue-600 active:bg-blue-700
                disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-4 focus:ring-blue-100
                transform hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
              "
            >
              回答を確認
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 