import { Category, Question, BlankField, ExamData } from '@/types/exam'

// examData.ts 파일의 CATEGORY_MAPPING 부분을 이 코드로 완전히 교체하세요.

const CATEGORY_MAPPING = {
  '微生物学 第1章 細菌の構造と機能': {
    id: 'micro-1-structure',
    nameEn: 'Bacterial Structure and Function',
    description: '細菌の基本構造、細胞壁、核様体など'
  },
  '微生物学 第2章 細菌の一般性状': {
    id: 'micro-2-properties',
    nameEn: 'General Properties of Bacteria',
    description: '細菌の成長、繁殖、芽胞、代謝など'
  },
  '微生物学 第3章 グラム陽性球菌およびグラム陰性球菌': {
    id: 'micro-3-cocci',
    nameEn: 'Gram-positive and Gram-negative Cocci',
    description: 'ブドウ球菌、レンサ球菌、髄膜炎菌など'
  },
  '微生物学 第4回 グラム陽性桿菌': {
    id: 'micro-4-gram-positive-bacilli',
    nameEn: 'Gram-positive Bacilli',
    description: '炭疽菌、ジフテリア菌、破傷風菌など'
  },
  '微生物学 第5回 グラム陰性桿菌': {
    id: 'micro-5-gram-negative-bacilli',
    nameEn: 'Gram-negative Bacilli',
    description: '大腸菌、サルモネラ、コレラ菌など'
  },
  '微生物学 第6回 特殊細菌': {
    id: 'micro-6-special-bacteria',
    nameEn: 'Special Bacteria',
    description: '結核菌、らせん菌、スピロヘータなど'
  },
  '微生物学 第7回 マイコプラズマ・リケッチア・クラミジア': {
    id: 'micro-7-mycoplasma-etc',
    nameEn: 'Mycoplasma, Rickettsia, Chlamydia',
    description: '細胞壁を持たない、または偏性細胞内寄生性の細菌'
  }
} as const

/**
 * exam.mdファイルからデータを抽出してパースする
 */
export function parseExamData(examContent: string): ExamData {
  const lines = examContent.split('\n')
  const categories: Category[] = []
  
  // 問題セクションと回答セクションを分離
  const problemSectionEnd = lines.findIndex(line => line.includes('### 回答集'))
  const problemLines = lines.slice(0, problemSectionEnd)
  const answerLines = lines.slice(problemSectionEnd)
  
  // 問題を解析
  const problemsByCategory = parseProblemsSection(problemLines)
  
  // 回答を解析
  const answersByCategory = parseAnswersSection(answerLines)
  
  // カテゴリを構築
  for (const categoryName of Object.keys(problemsByCategory)) {
    const mapping = CATEGORY_MAPPING[categoryName as keyof typeof CATEGORY_MAPPING]
    if (mapping) {
      const questions = problemsByCategory[categoryName]
      const answers = answersByCategory[categoryName] || {}
      
      // 回答を問題に結合
      questions.forEach(question => {
        question.blanks.forEach((blank, index) => {
          const questionNumber = parseInt(question.id.split('-').pop() || '0')
          if (answers[questionNumber]) {
            blank.answer = answers[questionNumber][index] || ''
          }
        })
      })
      
      categories.push({
        id: mapping.id,
        name: categoryName,
        nameEn: mapping.nameEn,
        description: mapping.description,
        questionCount: questions.length,
        questions: questions
      })
    }
  }

  return { categories }
}

/**
 * 問題セクションを解析
 */
function parseProblemsSection(lines: string[]): { [category: string]: Question[] } {
  const result: { [category: string]: Question[] } = {}
  let currentCategory: string | null = null
  let questionNumber = 0
  let currentQuestionText = ''
  let isInQuestion = false

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim()
    
    // 空行をスキップ
    if (!trimmedLine) continue
    
    // カテゴリヘッダーの検出
    const categoryMatch = trimmedLine.match(/^#### (.+?) \(.+?\)/)
    if (categoryMatch) {
      // 前の問題を保存
      if (currentCategory && isInQuestion && currentQuestionText) {
        const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim())
        result[currentCategory].push(question)
      }
      
      currentCategory = categoryMatch[1]
      result[currentCategory] = []
      questionNumber = 0
      currentQuestionText = ''
      isInQuestion = false
      continue
    }
    
    // 問題の検出
    const questionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/)
    if (questionMatch && currentCategory) {
      // 前の問題を保存
      if (isInQuestion && currentQuestionText) {
        const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim())
        result[currentCategory].push(question)
      }
      
      questionNumber = parseInt(questionMatch[1])
      currentQuestionText = questionMatch[2]
      isInQuestion = true
      continue
    }
    
    // 継続行の検出（リスト項目やインデントされた行）
    if (isInQuestion && currentCategory && (trimmedLine.startsWith('*') || trimmedLine.startsWith('    '))) {
      currentQuestionText += ' ' + trimmedLine
      continue
    }
    
    // その他の継続行
    if (isInQuestion && currentCategory && trimmedLine && !trimmedLine.match(/^#### /)) {
      currentQuestionText += ' ' + trimmedLine
      continue
    }
  }
  
  // 最後の問題を保存
  if (currentCategory && isInQuestion && currentQuestionText) {
    const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim())
    result[currentCategory].push(question)
  }
  
  return result
}

/**
 * 回答セクションを解析
 */
function parseAnswersSection(lines: string[]): { [category: string]: { [questionNumber: number]: string[] } } {
  const result: { [category: string]: { [questionNumber: number]: string[] } } = {}
  let currentCategory: string | null = null
  let currentQuestionNumber: number | null = null
  let currentAnswers: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim()
    
    // 空行をスキップ
    if (!trimmedLine) continue
    
    // カテゴリヘッダーの検出
    const categoryMatch = trimmedLine.match(/^#### (.+?) \(.+?\)/)
    if (categoryMatch) {
      // 前の問題の回答を保存
      if (currentCategory && currentQuestionNumber !== null && currentAnswers.length > 0) {
        if (!result[currentCategory]) result[currentCategory] = {}
        result[currentCategory][currentQuestionNumber] = currentAnswers
      }
      
      currentCategory = categoryMatch[1]
      result[currentCategory] = {}
      currentQuestionNumber = null
      currentAnswers = []
      continue
    }
    
    // 問題番号の検出
    const questionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/)
    if (questionMatch && currentCategory) {
      // 前の問題の回答を保存
      if (currentQuestionNumber !== null && currentAnswers.length > 0) {
        result[currentCategory][currentQuestionNumber] = currentAnswers
      }
      
      currentQuestionNumber = parseInt(questionMatch[1])
      const answerText = questionMatch[2]
      
      // 「該当なし」の場合はスキップ
      if (answerText.includes('該当なし')) {
        currentAnswers = []
        continue
      }
      
      currentAnswers = extractAnswersFromText(answerText)
      continue
    }
    
    // 継続する回答行の検出（インデントされた行や項目行）
    if (currentCategory && currentQuestionNumber !== null) {
      // ①②③項目の回答を検出
      const itemMatch = trimmedLine.match(/[①②③④⑤⑥⑦⑧⑨⑩]\s*\*\*([^*]+)\*\*/)
      if (itemMatch) {
        currentAnswers.push(itemMatch[1].trim())
        continue
      }
      
      // **答え**形式の継続行
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const additionalAnswers = extractAnswersFromText(trimmedLine)
        currentAnswers.push(...additionalAnswers)
        continue
      }
    }
  }
  
  // 最後の問題の回答を保存
  if (currentCategory && currentQuestionNumber !== null && currentAnswers.length > 0) {
    if (!result[currentCategory]) result[currentCategory] = {}
    result[currentCategory][currentQuestionNumber] = currentAnswers
  }
  
  return result
}

/**
 * 問題オブジェクトを作成
 */
function createQuestion(questionNumber: number, category: string, text: string): Question {
  const blanks: BlankField[] = []
  let blankCounter = 0
  
  // **...** パターンを検出し、中身がアンダースコア（虫食い）のみを抽出
  const allStarPattern = /\*\*(.*?)\*\*/g
  let match
  
  while ((match = allStarPattern.exec(text)) !== null) {
    const content = match[1]
    // 虫食い箇所かどうかチェック（バックスラッシュ+アンダースコアまたはアンダースコアのみ）
    // バックスラッシュエスケープされたアンダースコアに対応
    if (content.match(/^[\_\\]*\_+[\_\\]*$/) || content.match(/^\\+_+\\*$/) || content.includes('_')) {
      // アンダースコアが含まれている場合は虫食い箇所とみなす
      if (content.includes('_') && !content.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
        blanks.push({
          id: `blank-${blankCounter}`,
          answer: '', // 後で設定
          position: match.index,
          placeholder: `回答${blankCounter + 1}`
        })
        blankCounter++
      }
    }
  }
  
  const categoryMapping = CATEGORY_MAPPING[category as keyof typeof CATEGORY_MAPPING]
  const categoryId = categoryMapping?.id || category.toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  return {
    id: `${categoryId}-${questionNumber}`,
    category: categoryId,
    text: text,
    blanks: blanks
  }
}

/**
 * 回答テキストから個別の回答を抽出
 */
function extractAnswersFromText(text: string): string[] {
  // **答え**形式の回答を抽出
  const boldAnswers = text.match(/\*\*([^*]+)\*\*/g)
  if (boldAnswers) {
    return boldAnswers.map(answer => answer.replace(/\*\*/g, '').trim())
  }
  
  // フォールバック：空の配列を返す
  return []
} 