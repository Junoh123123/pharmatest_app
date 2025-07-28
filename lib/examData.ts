// lib/examData.ts (이 코드로 전체를 교체)

import type { Category, Question, BlankField, Subject, FillInTheBlankQuestion } from '@/types/exam'

type CategoryMapping = {
  [key: string]: {
    id: string;
    name: string; // Added to align with Category
    nameEn: string;
    description: string;
    start: number;
    end: number;
    questionCount: number; // Made mandatory
    questions: Question[]; // Made mandatory
  };
};

// ========================================================================
//  기존 파서 (수정 없음)
// ========================================================================

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

  const problemSectionEnd = lines.findIndex((line) => line.includes('### 回答集'));
  const problemLines = lines.slice(0, problemSectionEnd);
  const answerLines = lines.slice(problemSectionEnd);

  const problemsByCategory = parseProblemsSection(problemLines, categoryConfig);
  const answersByCategory = parseAnswersSection(answerLines, categoryConfig);

  const categories: Category[] = Object.keys(problemsByCategory).map((categoryName) => {
    const mapping = categoryConfig[categoryName.trim()];
    const questions = problemsByCategory[categoryName];
    const answers = answersByCategory[categoryName] || {};

    questions.forEach((question) => {
      if (question.type === 'fill-in-the-blank' && 'absoluteNumber' in question) {
        const originalQuestionNumber = (question as FillInTheBlankQuestion & { absoluteNumber: number }).absoluteNumber;
        question.blanks.forEach((blank, index) => {
          const answerList = answers[originalQuestionNumber];
          if (answerList && answerList[index]) {
            blank.answer = answerList[index];
          }
        });
      }
    });

    const questionsWithRelativeNumbers = questions.map((question, index) => ({
      ...question,
      absoluteNumber: parseInt(question.id.split('-').pop() || '0'),
      id: `${mapping.id}-${index + 1}`,
    }));

    return {
      id: mapping.id,
      name: mapping.name.trim(),
      nameEn: mapping.nameEn.trim(),
      description: mapping.description.trim(),
      start: mapping.start,
      end: mapping.end,
      questionCount: questions.length,
      questions: questionsWithRelativeNumbers,
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
  let counter = 0; // 카테고리 내 상대적 위치 (1부터 시작)
  let originalNumber = 0; // 원본 문제 번호
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
          const question = createQuestion(counter + 1, originalNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
          result[currentCategory].push(question);
        }
        currentCategory = potentialCategoryName;
        result[currentCategory] = [];
        counter = 0;
        currentQuestionText = '';
        isInQuestion = false;
        continue;
      }
    }
    
    if (currentCategory) {
      const questionMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (questionMatch) {
        if (isInQuestion && currentQuestionText) {
          // 이전 문제 저장
          const question = createQuestion(counter + 1, originalNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
          result[currentCategory].push(question);
        }
        counter++; // 새 문제를 만날 때마다 증가
        originalNumber = parseInt(questionMatch[1]);
        currentQuestionText = questionMatch[2];
        isInQuestion = true;
      } else if (isInQuestion) {
        currentQuestionText += ' ' + line;
      }
    }
  }

  if (currentCategory && isInQuestion && currentQuestionText) {
    const question = createQuestion(counter + 1, originalNumber, currentCategory, currentQuestionText.trim(), categoryConfig);
    result[currentCategory].push(question);
  }
  
  return result;
}

function parseAnswersSection(lines: string[], categoryConfig: { [key: string]: Category }): { [category: string]: { [questionNumber: number]: string[] } } {
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
      if (categoryConfig[potentialCategoryName]) {
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
          if (!result[currentCategory]) result[currentCategory] = {};
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

function createQuestion(relativeNumber: number, originalNumber: number, category: string, text: string, categoryConfig: CategoryMapping): FillInTheBlankQuestion {
  const blanks: BlankField[] = [];
  let blankCounter = 0;
  
  const allStarPattern = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = allStarPattern.exec(text)) !== null) {
    const content = match[1];
    if (content.includes('_') && !content.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
      blanks.push({
        id: `blank-${blankCounter}`,
        answer: '',
        position: match.index,
        placeholder: `回答${blankCounter + 1}`
      });
      blankCounter++;
    }
  }
  
  const categoryMapping = categoryConfig[category.trim()];
  const categoryId = categoryMapping?.id || category.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return {
    type: 'fill-in-the-blank', 
    id: `${categoryId}-${relativeNumber}`,
    category: categoryId,
    text: text,
    blanks: blanks,
    absoluteNumber: originalNumber // 원본 문제 번호 저장
  };
}

function extractAnswersFromText(text: string): string[] {
  const boldAnswers = text.match(/\*\*([^*]+)\*\*/g);
  if (boldAnswers) {
    return boldAnswers.map((answer) => answer.replace(/\*\*/g, '').trim());
  }
  return [];
}

// ========================================================================
//  생명윤리 과목 전용 파서 (✅ 타입 에러 최종 수정 버전)
// ========================================================================
export function parseChoiceQuizData(
  markdownContent: string,
  subjectConfig: Subject
): Subject {
  const categories: Category[] = subjectConfig.categories.map(catConfig => {

    // BOM, 유니코드 공백, 전각/반각 등도 무시하고 비교
    const normalize = (str: string) => str.replace(/^\uFEFF/, '').replace(/[\s\u3000]+/g, '').trim();
    const normalizedCatName = normalize(catConfig.name);
    // 헤더를 한 줄씩 직접 찾아서 비교
    const lines = markdownContent.split(/\r?\n/);
    let match = null;
    for (let i = 0, acc = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^#{1,3}/)) {
        const headerText = normalize(line.replace(/^#{1,3}/, ''));
        if (headerText.startsWith(normalizedCatName)) {
          match = { 0: line, index: acc };
          break;
        }
      }
      acc += line.length + 1; // +1 for newline
    }

    let categoryContent = '';

    if (match && typeof match.index === 'number' && match[0]) {
        const startIndex = match.index + match[0].length;
        // 다음 카테고리 헤더(#, ##, ###)를 정확히 찾아 해당 카테고리 문제만 추출
        // startIndex 이후의 텍스트에서 다음 헤더의 실제 위치(문서 전체 기준)를 구함
        const rest = markdownContent.substring(startIndex);
        // 다음 헤더를 찾되, 현재 헤더와 동일한 레벨(#의 개수)만 찾음
        const headerMatchResult = match[0].match(/^#+/);
        const currentHeaderLevel = headerMatchResult ? headerMatchResult[0].length : 1;
        const nextHeaderRegex = new RegExp(`^#{${currentHeaderLevel},}\s+`, 'm');
        const nextHeaderMatch = rest.match(nextHeaderRegex);
        const endIndex = nextHeaderMatch && typeof nextHeaderMatch.index === 'number'
            ? startIndex + nextHeaderMatch.index
            : markdownContent.length;
        categoryContent = markdownContent.substring(startIndex, endIndex).trim();
        // 만약 categoryContent가 비어있고, 헤더가 파일 맨 앞(0)에 있으면 파일 전체에서 헤더 이후를 사용
        if (!categoryContent && match.index === 0) {
          categoryContent = markdownContent.substring(startIndex).trim();
        }
    } else {
        console.warn(`[Parser Warning] Category header not found in Markdown for: "${catConfig.name}"`);
    }

    const questionBlocks = categoryContent.split('---').filter(b => b.trim() !== '');
    
    // ✅ BUG FIX: .map의 반환 타입을 명시하고, .filter의 타입 가드를 수정하여 타입 에러 해결
    const questions: Question[] = questionBlocks.map((block, index): Question | null => {
      // index는 0부터 시작하므로 1을 더해서 1부터 시작하는 번호로 만듦
      const relativeNumber = index + 1;
      const questionId = `${catConfig.id}-${relativeNumber}`;
      
      const typeMatch = block.match(/TYPE:\s*(ox|multiple-choice)/);
      const questionType = typeMatch ? typeMatch[1] : null;
      
      const answerMatch = block.match(/###\s*ANSWER\s*([\s\S]*)/i);
      const rawAnswer = answerMatch ? answerMatch[1].trim() : '';
      

      // 더 유연한 문제 텍스트 추출: '##'로 시작하는 라인 이후부터 OPTIONS/ANSWER 전까지, 없으면 block 전체에서 TYPE/OPTIONS/ANSWER 제거
      let text = '';
      const textMatch = block.match(/##.*\n([\s\S]*?)(?=###\s*OPTIONS|###\s*ANSWER)/i);
      if (textMatch) {
        text = textMatch[1]
          .replace(/TYPE:\s*(ox|multiple-choice)/i, '') // TYPE 라인 제거
          .trim();
      } else {
        // '##'가 없는 경우, TYPE/OPTIONS/ANSWER 등 메타데이터를 제거하고 남은 부분을 텍스트로 사용
        text = block
          .replace(/TYPE:\s*(ox|multiple-choice)/i, '')
          .replace(/###\s*OPTIONS[\s\S]*?(?=###\s*ANSWER|$)/i, '')
          .replace(/###\s*ANSWER[\s\S]*/i, '')
          .trim();
      }
      if (!text) {
        text = "문제 텍스트를 찾을 수 없습니다.";
      }
      
      // Q숫자 형식의 라벨과 주변 공백 제거
      text = text.replace(/^##\s*Q\d+\s*\n*/i, '').trim();
      
      if (questionType === 'ox') {
        // T/F를 O/X로 변환
        let answer = rawAnswer.toUpperCase();
        if (answer === 'T') answer = 'O';
        if (answer === 'F') answer = 'X';
        return {
          id: questionId,
          category: catConfig.id,
          type: 'ox',
          text: text,
          answer: answer as 'O' | 'X',
        };
      } 
      
      return null;
    }).filter((q): q is Question => q !== null);

    // ✅ start와 end 범위에 맞는 문제만 필터링
    const filteredQuestions = questions.filter((_, index) => {
      const questionNumber = index + 1;  // 1부터 시작하는 문제 번호
      return questionNumber >= catConfig.start && questionNumber <= catConfig.end;
    });

    return {
      ...catConfig,
      questionCount: catConfig.end - catConfig.start + 1,  // 범위 기반으로 문제 수 계산
      questions: filteredQuestions.map((q, idx) => ({
        ...q,
        id: `${catConfig.id}-${idx + catConfig.start}`  // 문제 ID를 범위 시작 번호부터 부여
      })),
    };
  });

  return {
    ...subjectConfig,
    categories: categories,
  };
}