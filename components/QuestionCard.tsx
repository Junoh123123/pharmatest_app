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
      if (answer.questionId === question.id && answer.blankId) {
        initialAnswers[answer.blankId] = answer.answer
      }
    })
    return initialAnswers
  })

  const [oxAnswer, setOxAnswer] = useState<string>(() => {
    const oxUserAnswer = userAnswers.find(answer => 
      answer.questionId === question.id && question.type === 'ox'
    )
    return oxUserAnswer ? oxUserAnswer.answer : ''
  })

  const handleInputChange = useCallback((blankId: string, value: string) => {
    if (!question || question.type !== 'fill-in-the-blank') return
    
    const newAnswers = { ...answers, [blankId]: value }
    setAnswers(newAnswers)

    // UserAnswer배열을 업데이트
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

  const handleOXAnswerChange = useCallback((answer: string) => {
    if (!question || question.type !== 'ox') return
    
    setOxAnswer(answer)
    const updatedUserAnswers = userAnswers.filter(
      ua => ua.questionId !== question.id
    )
    updatedUserAnswers.push({
      questionId: question.id,
      blankId: '',
      answer: answer
    })
    onAnswersChange(updatedUserAnswers)
  }, [question, userAnswers, onAnswersChange])

  if (!question) {
    return <div>Loading...</div>
  }

  // OX 문제인 경우
  if (question.type === 'ox') {
    const isAnswered = oxAnswer.trim().length > 0
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* 프로그레스 바 */}
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

        {/* OX 문제 카드 */}
        <div className="
          bg-white/80 backdrop-blur-xl rounded-3xl 
          border border-gray-200/50 shadow-xl
          p-8 mb-8
        ">
          {/* 문제문 */}
          <div className="text-lg leading-relaxed text-gray-800 mb-8">
            {question.text}
          </div>

          {/* OX 선택 버튼 */}
          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={() => handleOXAnswerChange('O')}
              disabled={isSubmitted}
              className={`
                px-8 py-4 rounded-2xl font-semibold text-xl
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-4 focus:ring-blue-100
                transform hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
                ${oxAnswer === 'O' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
            >
              ○ (正しい)
            </button>
            <button
              onClick={() => handleOXAnswerChange('X')}
              disabled={isSubmitted}
              className={`
                px-8 py-4 rounded-2xl font-semibold text-xl
                transition-all duration-200 ease-out
                focus:outline-none focus:ring-4 focus:ring-blue-100
                transform hover:scale-[1.02] active:scale-[0.98]
                shadow-lg hover:shadow-xl
                ${oxAnswer === 'X' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
            >
              × (間違い)
            </button>
          </div>

          {/* 회답 버튼 */}
          {!isSubmitted && (
            <div className="flex justify-center">
              <button
                onClick={onSubmit}
                disabled={!isAnswered}
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

  // fill-in-the-blank 문제인 경우
  if (question.type === 'fill-in-the-blank') {
    const questionParts = splitQuestionForInputs(question.text)
    const allAnswersFilled = question.blanks.every(blank => 
      answers[blank.id]?.trim().length > 0
    )

    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* 프로그레스 바 */}
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

        {/* 문제 카드 */}
        <div className="
          bg-white/80 backdrop-blur-xl rounded-3xl 
          border border-gray-200/50 shadow-xl
          p-8 mb-8
        ">
          {/* 문제문 */}
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

          {/* 회답 버튼 */}
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

  // 지원되지 않는 문제 타입
  return <div>Unsupported question type: {(question as { type: string }).type}</div>
}
