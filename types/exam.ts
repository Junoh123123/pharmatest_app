export interface Question {
  id: string
  category: string
  text: string
  blanks: BlankField[]
}

export interface BlankField {
  id: string
  answer: string
  position: number
  placeholder?: string
}

export interface Category {
  id: string
  name: string
  nameEn: string
  description: string
  questionCount: number
  questions: Question[]
}

export interface UserAnswer {
  questionId: string
  blankId: string
  answer: string
}

export interface QuestionResult {
  questionId: string
  isCorrect: boolean
  correctAnswers: string[]
  userAnswers: string[]
  score: number
  maxScore: number
}

export interface ExamSession {
  categoryId: string
  currentQuestionIndex: number
  answers: UserAnswer[]
  results: QuestionResult[]
  startTime: Date
  isCompleted: boolean
}

export interface ExamData {
  categories: Category[]
} 