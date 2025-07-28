// =================================================================
// 📝 문제(Question) 관련 타입 정의 (핵심 변경 영역)
// =================================================================

/**
 * 모든 문제 유형이 공통으로 가지는 기본 속성
 */
interface QuestionBase {
  id: string;
  category: string;
  absoluteNumber?: number;  // 원본 문제 번호를 저장하기 위한 옵션 필드
  text: string; // 문제의 본문
}

/**
 * 유형 1: 빈칸 채우기 문제 (기존 Question 인터페이스와 거의 동일)
 */
export interface FillInTheBlankQuestion extends QuestionBase {
  type: 'fill-in-the-blank'; // 문제 유형 식별자
  blanks: BlankField[];
}

/**
 * 유형 2: OX 퀴즈 문제
 */
export interface OXQuestion extends QuestionBase {
  type: 'ox'; // 문제 유형 식별자
  answer: 'O' | 'X' | 'T' | 'F'; // 정답 (O/X 또는 T/F)
}

/**
 * 앱에서 사용하는 모든 문제의 통합 타입
 * 이 타입을 사용하면 TypeScript가 type 필드를 보고 어떤 문제인지 추론해준다.
 */
export type Question = FillInTheBlankQuestion | OXQuestion;


// =================================================================
// 📚 기존 타입 정의
// =================================================================

/**
 * 시험의 카테고리 정보
 */
export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  start: number;
  end: number;
  questionCount: number;
  questions: Question[];
}

/**
 * 시험 과목 정보
 */
export interface Subject {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

/**
 * 빈칸 채우기 문제의 각 빈칸에 대한 정보
 */
export interface BlankField {
  id: string;
  answer: string;
  position: number;
  placeholder?: string;
}

/**
 * 과목 정보 (수정 없음)
 */
export interface Subject {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

/**
 * 카테고리(챕터) 정보 (questions 필드의 타입만 새로운 Question 유니온 타입으로 변경됨)
 */
export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  questionCount: number;
  questions: Question[]; // ✨ 이 부분이 새로운 Question 타입으로 자동 업데이트된다
}

/**
 * 사용자의 답변 정보 (빈칸 채우기 전용, 수정 없음)
 * 새로운 문제 유형의 답변은 다음 단계에서 별도의 타입으로 관리할 예정.
 */
export interface UserAnswer {
  questionId: string;
  blankId?: string;
  answer: string;
}

/**
 * 문제 채점 결과 (수정 없음)
 */
export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswers: string[];
  userAnswers: string[];
  score: number;
  maxScore: number;
}

/**
 * 전체 시험 세션 정보 (수정 없음)
 */
export interface ExamSession {
  categoryId: string;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  results: QuestionResult[];
  startTime: Date;
  isCompleted: boolean;
}

/**
 * 전체 시험 데이터 (수정 없음)
 */
export interface ExamData {
  subjects: Subject[];
}