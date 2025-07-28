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

  // 문제 유형별로 분기
  if (question.type === 'fill-in-the-blank') {
    let correctCount = 0;
    const totalBlanks = question.blanks.length;
    const correctAnswers: string[] = [];
    const userAnswerTexts: string[] = [];
    const options = (question as any).options || [];
    for (let i = 0; i < question.blanks.length; i++) {
      const blank = question.blanks[i];
      const userAnswer = questionAnswers.find(answer => answer.blankId === blank.id);
      const allowedAnswers = blank.answer.split('|');
      let normalizedUser = userAnswer ? normalizeAnswer(userAnswer.answer) : '';
      // 정답이 숫자(인덱스)이고, 사용자가 문자열(선택지)로 입력한 경우, 선택지 인덱스를 찾아서 1-based로 변환
      if (allowedAnswers.every(ans => /^\d+$/.test(ans))) {
        // 정답이 모두 숫자라면(인덱스 기반)
        if (userAnswer && options.length > 0) {
          const idx = options.findIndex((opt: string) => normalizeAnswer(opt) === normalizeAnswer(userAnswer.answer));
          if (idx !== -1) {
            normalizedUser = String(idx + 1); // 1-based 인덱스
          }
        }
      }
      const normalizedAllowed = allowedAnswers.map(a => normalizeAnswer(a));
      correctAnswers.push(blank.answer);
      userAnswerTexts.push(userAnswer?.answer || '');
      if (normalizedAllowed.includes(normalizedUser)) {
        correctCount++;
      }
    }
    const score = correctCount;
    const maxScore = totalBlanks;
    const isCorrect = score === maxScore && score > 0;
    return {
      questionId: question.id,
      isCorrect,
      correctAnswers,
      userAnswers: userAnswerTexts,
      score,
      maxScore
    };
  }

  if (question.type === 'ox') {
    // OX 문제 채점 (O/X, T/F 모두 허용)
    let user = questionAnswers[0]?.answer?.toUpperCase() || '';
    let correct = (question.answer || '').toUpperCase();
    // 입력이 T/F면 O/X로 변환
    if (user === 'T') user = 'O';
    if (user === 'F') user = 'X';
    if (correct === 'T') correct = 'O';
    if (correct === 'F') correct = 'X';
    const isCorrect = user === correct && !!user;
    return {
      questionId: question.id,
      isCorrect,
      correctAnswers: [correct],
      userAnswers: [user],
      score: isCorrect ? 1 : 0,
      maxScore: 1
    }
  }

  // fallback (정의되지 않은 타입)
  return {
    questionId: (question as any).id,
    isCorrect: false,
    correctAnswers: [],
    userAnswers: [],
    score: 0,
    maxScore: 1
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