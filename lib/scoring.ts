// lib/scoring.ts 파일의 전체 내용을 이 코드로 교체하세요.

import { Question, UserAnswer, QuestionResult } from '@/types/exam'

/**
 * 回答を正規化（大文字小文字、空白の除去など）
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[「」()（）]/g, '') // 括弧を除去
}

/**
 * 単一問題の採点
 */
export function scoreQuestion(
  question: Question, 
  userAnswers: UserAnswer[]
): QuestionResult {
  const questionAnswers = userAnswers.filter(
    answer => answer.questionId === question.id
  )
  
  let correctCount = 0
  const totalBlanks = question.blanks.length
  const correctAnswers: string[] = []
  const userAnswerTexts: string[] = []
  
  // 각 빈칸을 순회하며 채점합니다.
  for (const blank of question.blanks) {
    const userAnswer = questionAnswers.find(
      answer => answer.blankId === blank.id
    )
    
    // 1. | 로 정답 패턴들을 분리합니다.
    const allowedAnswers = blank.answer.split('|');
    // 2. 각 정답 패턴과 사용자 답을 정규화합니다.
    const normalizedAllowed = allowedAnswers.map(a => normalizeAnswer(a));
    const normalizedUser = userAnswer ? normalizeAnswer(userAnswer.answer) : '';
    
    correctAnswers.push(blank.answer);
    userAnswerTexts.push(userAnswer?.answer || '');
    
    // 3. 정규화된 사용자 답이 정규화된 정답 패턴 목록에 포함되는지 확인합니다.
    if (normalizedAllowed.includes(normalizedUser)) {
      correctCount++;
    }
  }
  
  const score = correctCount
  const maxScore = totalBlanks
  const isCorrect = score === maxScore && score > 0
  
  return {
    questionId: question.id,
    isCorrect,
    correctAnswers,
    userAnswers: userAnswerTexts,
    score,
    maxScore
  }
}

/**
 * セッション全体の採点
 */
export function calculateSessionScore(results: QuestionResult[]) {
  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const totalMaxScore = results.reduce((sum, result) => sum + result.maxScore, 0)
  const correctQuestions = results.filter(result => result.isCorrect).length
  
  return {
    totalScore,
    totalMaxScore,
    correctQuestions,
    totalQuestions: results.length,
    percentage: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0
  }
}

/**
 * 問題文の虫食い部分をplaceholderに置換
 */
export function formatQuestionText(questionText: string): string {
  let counter = 0
  return questionText.replace(/\*\*[\_]+\*\*/g, () => {
    counter++
    return `[${counter}]`
  })
}

/**
 * 問題文の虫食い部分をinput要素に置換するためのパーツに分割
 */
export function splitQuestionForInputs(questionText: string): Array<{ type: 'text' | 'input', content: string, blankIndex?: number }> {
  const parts: Array<{ type: 'text' | 'input', content: string, blankIndex?: number }> = []
  let lastIndex = 0
  let blankIndex = 0
  
  const allStarPattern = /\*\*(.*?)\*\*/g
  let match
  
  while ((match = allStarPattern.exec(questionText)) !== null) {
    const content = match[1]
    const isBlank = content.includes('_') && !content.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)
    
    if (isBlank) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: questionText.slice(lastIndex, match.index)
        })
      }
      
      parts.push({
        type: 'input',
        content: '',
        blankIndex: blankIndex++
      })
      
      lastIndex = match.index + match[0].length
    }
  }
  
  if (lastIndex < questionText.length) {
    parts.push({
      type: 'text',
      content: questionText.slice(lastIndex)
    })
  }
  
  return parts
}