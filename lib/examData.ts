// lib/examData.ts (이 코드로 전체를 교체)

import type { Category, Question, BlankField, Subject } from '@/types/exam'

type CategoryMapping = {
  [key:string]: {
    id: string;
    nameEn: string;
    description: string;
  };
};

export function parseSubjectData(
  markdownContent: string,
  subjectConfig: {
    id: string;
    name: string;
    description: string;
  },
  categoryConfig: CategoryMapping
): Subject {
  const lines = markdownContent.split('\n');
  
  const problemSectionEnd = lines.findIndex(line => line.includes('### 回答集'));
  const problemLines = lines.slice(0, problemSectionEnd);
  const answerLines = lines.slice(problemSectionEnd);

  const problemsByCategory = parseProblemsSection(problemLines, categoryConfig);
  const answersByCategory = parseAnswersSection(answerLines, categoryConfig);
  
  const categories: Category[] = Object.keys(problemsByCategory).map(categoryName => {
    const mapping = categoryConfig[categoryName.trim()];
    const questions = problemsByCategory[categoryName];
    const answers = answersByCategory[categoryName] || {};

    questions.forEach(question => {
      question.blanks.forEach((blank, index) => {
        const questionNumber = parseInt(question.id.split('-').pop() || '0');
        if (answers[questionNumber] && answers[questionNumber][index]) {
          // 👇 각 빈칸에 해당하는 정답 '문자열'을 할당
          blank.answer = answers[questionNumber][index];
        }
      });
    });
    
    return {
      id: mapping.id,
      name: categoryName.trim(),
      nameEn: mapping.nameEn.trim(),
      description: mapping.description.trim(),
      questionCount: questions.length,
      questions: questions
    };
  });

  return {
    id: subjectConfig.id,
    name: subjectConfig.name.trim(),
    description: subjectConfig.description.trim(),
    categories: categories,
  };
}

function parseProblemsSection(lines: string[], categoryConfig: CategoryMapping): { [category: string]: Question[] } {
  const result: { [category: string]: Question[] } = {};
  let currentCategory: string | null = null;
  let questionNumber = 0;
  let currentQuestionText = '';
  let isInQuestion = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const categoryMatch = trimmedLine.match(/^####\s+(.+?)(?:\s+\(.+\))?$/);
    if (categoryMatch) {
      const potentialCategoryName = categoryMatch[1].trim();
      if (categoryConfig[potentialCategoryName]) {
        if (currentCategory && isInQuestion && currentQuestionText) {
          const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
          result[currentCategory].push(question);
        }
        currentCategory = potentialCategoryName;
        result[currentCategory] = [];
        questionNumber = 0;
        currentQuestionText = '';
        isInQuestion = false;
        continue;
      }
    }
    
    if (currentCategory) {
      const questionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (questionMatch) {
        if (isInQuestion && currentQuestionText) {
          const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
          result[currentCategory].push(question);
        }
        questionNumber = parseInt(questionMatch[1]);
        currentQuestionText = questionMatch[2];
        isInQuestion = true;
      } else if (isInQuestion) {
        currentQuestionText += ' ' + line;
      }
    }
  }

  if (currentCategory && isInQuestion && currentQuestionText) {
    const question = createQuestion(questionNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
    result[currentCategory].push(question);
  }
  
  return result;
}

function parseAnswersSection(lines: string[], categoryConfig: CategoryMapping): { [category: string]: { [questionNumber: number]: string[] } } {
  const result: { [category: string]: { [questionNumber: number]: string[] } } = {};
  let currentCategory: string | null = null;
  let currentQuestionNumber: number | null = null;
  let currentAnswers: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const categoryMatch = trimmedLine.match(/^####\s+(.+?)(?:\s+\(.+\))?$/);
    if (categoryMatch) {
       const potentialCategoryName = categoryMatch[1].trim();
       if(categoryConfig[potentialCategoryName]) {
          if (currentCategory && currentQuestionNumber !== null && currentAnswers.length > 0) {
            if (!result[currentCategory]) result[currentCategory] = {};
            result[currentCategory][currentQuestionNumber] = currentAnswers;
          }
          currentCategory = potentialCategoryName;
          result[currentCategory] = {};
          currentQuestionNumber = null;
          currentAnswers = [];
          continue;
       }
    }

    if (currentCategory) {
        const questionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
        if (questionMatch) {
            if (currentQuestionNumber !== null && currentAnswers.length > 0) {
              result[currentCategory][currentQuestionNumber] = currentAnswers;
            }
            currentQuestionNumber = parseInt(questionMatch[1]);
            const answerText = questionMatch[2];
            currentAnswers = answerText.includes('該当なし') ? [] : extractAnswersFromText(answerText);
        }
    }
  }

  if (currentCategory && currentQuestionNumber !== null && currentAnswers.length > 0) {
    if (!result[currentCategory]) result[currentCategory] = {};
    result[currentCategory][currentQuestionNumber] = currentAnswers;
  }
  
  return result;
}

function createQuestion(questionNumber: number, category: string, text: string, categoryConfig: CategoryMapping): Question {
  const blanks: BlankField[] = [];
  let blankCounter = 0;
  
  const allStarPattern = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = allStarPattern.exec(text)) !== null) {
    const content = match[1];
    if (content.includes('_') && !content.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
      blanks.push({
        id: `blank-${blankCounter}`,
        answer: '', // 정답은 나중에 채워진다
        position: match.index,
        placeholder: `回答${blankCounter + 1}`
      });
      blankCounter++;
    }
  }
  
  const categoryMapping = categoryConfig[category.trim()];
  const categoryId = categoryMapping?.id || category.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return {
    id: `${categoryId}-${questionNumber}`,
    category: categoryId,
    text: text,
    blanks: blanks
  };
}

/**
 * 👇 이 함수가 scoring.ts와 호환되도록 수정됨
 * 정답 문자열을 나누지 않고 원본 그대로 반환한다.
 */
function extractAnswersFromText(text: string): string[] {
    // 예: "**GABA|グリシン**" -> ["GABA|グリシン"]
    // 예: "**H₂O**、**CO**" -> ["H₂O", "CO"]
    const boldAnswers = text.match(/\*\*([^*]+)\*\*/g);
    if (boldAnswers) {
        // `**`를 제거하고 각 정답 덩어리를 trim 처리만 한다
        return boldAnswers.map(answer => answer.replace(/\*\*/g, '').trim());
    }
    return [];
}