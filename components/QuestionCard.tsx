// components/QuestionCard.tsx (이 코드로 전체를 교체)

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Question, UserAnswer, FillInTheBlankQuestion } from '@/types/exam'
import { splitQuestionForInputs } from '@/lib/scoring'
import { OXQuizUI } from './OXQuizUI'

interface QuestionCardProps {
  // 👇 question이 아직 로딩 중일 수 있으므로 'undefined'일 가능성을 타입에 추가
  question: Question | undefined
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
  // ✅ 해결: question 데이터가 준비되지 않았다면, 렌더링을 잠시 멈춘다.
  if (!question) {
    // 부모 컴포넌트에서 데이터 로딩이 완료될 때까지 빈 화면을 보여주거나 로딩 스피너를 보여줄 수 있다.
    return null; 
  }

  // --- 아래 코드는 question이 존재함을 보장받은 상태에서 실행된다 ---

  const [blankAnswers, setBlankAnswers] = useState<{ [blankId: string]: string }>(() => {
    const initialAnswers: { [blankId: string]: string } = {}
    if (question.type === 'fill-in-the-blank') {
      userAnswers.forEach(answer => {
        if (answer.questionId === question.id && answer.blankId) {
          initialAnswers[answer.blankId] = answer.answer
        }
      })
    }
    return initialAnswers
  })
  

  // 복수선택 지원: multiple-choice는 string[]로 관리
  // OX와 객관식 선택값을 분리 관리
  const [oxAnswer, setOxAnswer] = useState<string>(() => {
    if (question.type === 'ox') {
      const answer = userAnswers.find(ua => ua.questionId === question.id);
      return answer ? answer.answer : '';
    }
    return '';
  });
  // OX 문제도 userAnswers, question이 바뀔 때마다 동기화
  useEffect(() => {
    if (question.type === 'ox') {
      const answer = userAnswers.find(ua => ua.questionId === question.id);
      setOxAnswer(answer ? answer.answer : '');
    }
  }, [userAnswers, question]);

  const handleBlankAnswerChange = useCallback((blankId: string, value: string) => {
    const newAnswers = { ...blankAnswers, [blankId]: value };
    setBlankAnswers(newAnswers);

    // 각 blankId별로 하나의 답변만 남도록 덮어쓰기
    let updatedUserAnswers = userAnswers.filter(
      answer => answer.questionId !== question.id || !answer.blankId
    );

    (question as FillInTheBlankQuestion).blanks.forEach(blank => {
      let answerValue = newAnswers[blank.id];
      if (answerValue) {
        updatedUserAnswers = updatedUserAnswers.filter(
          ua => !(ua.questionId === question.id && ua.blankId === blank.id)
        );
        updatedUserAnswers.push({
          questionId: question.id,
          blankId: blank.id,
          answer: answerValue
        });
      }
    });
    onAnswersChange(updatedUserAnswers);
  }, [blankAnswers, userAnswers, question, onAnswersChange]);


  const handleOxAnswerChange = useCallback((answer: string) => {
    setOxAnswer(answer);
    const otherAnswers = userAnswers.filter(ua => ua.questionId !== question.id);
    const newAnswer: UserAnswer = {
      questionId: question.id,
      answer
    };
    onAnswersChange([...otherAnswers, newAnswer]);
  }, [userAnswers, question.id, onAnswersChange]);


  const allAnswersFilled = useMemo(() => {
    if (question.type === 'fill-in-the-blank') {
      return question.blanks.every(blank => blankAnswers[blank.id]?.trim().length > 0);
    }
    if (question.type === 'ox') {
      return userAnswers.some(ua => ua.questionId === question.id && ua.answer !== '');
    }
    return false;
  }, [question, blankAnswers, userAnswers]);

  const renderAnswerArea = () => {
    switch (question.type) {
      case 'fill-in-the-blank':
        // 빈칸이 객관식 선택지(옵션)를 가지는 경우, 각 빈칸마다 MultipleChoiceQuizUI를 렌더링
        const questionParts = splitQuestionForInputs(question.text);
        return (
          <div className="text-lg leading-relaxed text-gray-800 mb-8">
            {questionParts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index} className="whitespace-pre-wrap">{part.content}</span>;
              } else {
                const blank = question.blanks[part.blankIndex!];
                return (
                  <span key={index} className="inline-block">
                    <input
                      type="text"
                      value={blankAnswers[blank.id] || ''}
                      onChange={(e) => handleBlankAnswerChange(blank.id, e.target.value)}
                      disabled={isSubmitted}
                      placeholder={blank.placeholder}
                      className="inline-block min-w-[120px] w-auto px-3 py-2 mx-1 text-center font-medium text-gray-900 bg-blue-50/50 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-600"
                      style={{ width: `${Math.max(120, (blankAnswers[blank.id]?.length || 0) * 12 + 60)}px` }}
                    />
                  </span>
                );
              }
            })}
          </div>
        );
      
      case 'ox':
        return (
          <>
            <p className="text-lg leading-relaxed text-gray-800 mb-8 whitespace-pre-wrap">{question.text}</p>
            <OXQuizUI 
              selectedValue={oxAnswer}
              onAnswer={handleOxAnswerChange}
              isSubmitted={isSubmitted}
            />
          </>
        )


      default:
        // 컴파일러는 이 코드가 도달 불가능하다고 추론하지만, 만약을 위한 방어 코드
        const _exhaustiveCheck: never = question;
        return <div>지원하지 않는 문제 유형입니다: {(_exhaustiveCheck as any)?.type}</div>
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* プログレスバー */}
            <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            問題 {questionNumber + 1} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(((questionNumber + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((questionNumber + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 문제 카드 */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl p-8 mb-8">
        {renderAnswerArea()}

        {/* 회답 버튼 */}
        {!isSubmitted && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onSubmit}
              disabled={!allAnswersFilled}
              className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-blue-100 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              回答を確認
            </button>
          </div>
        )}
      </div>
    </div>
  )
}