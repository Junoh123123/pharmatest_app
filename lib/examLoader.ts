// lib/examLoader.ts (이 코드로 전체를 교체)

import { promises as fs } from 'fs'
import path from 'path'
import { parseSubjectData } from './examData'
import { ExamData, Subject } from '@/types/exam'
import { subjectsConfig } from '@/content'

let cachedExamData: ExamData | null = null;

async function loadAllData(): Promise<ExamData> {
  // 개발 환경에서는 항상 파일을 새로 읽어온다.
  if (process.env.NODE_ENV === 'development') {
    return await fetchAllSubjects();
  }

  // 프로덕션 환경에서는 캐시된 데이터를 사용한다.
  if (cachedExamData) {
    return cachedExamData;
  }
  
  cachedExamData = await fetchAllSubjects();
  return cachedExamData;
}

async function fetchAllSubjects(): Promise<ExamData> {
  const subjects: Subject[] = [];

  for (const config of subjectsConfig) {
    // 각 과목의 설정 파일(config)에 명시된 id를 사용해 markdown 파일 경로를 만든다.
    const markdownPath = path.join(process.cwd(), `content/${config.subject.id}.md`);
    try {
      const markdownContent = await fs.readFile(markdownPath, 'utf-8');
      
      // 마크다운 내용과 해당 과목의 설정을 함께 파서에 넘겨준다.
      const subjectData = parseSubjectData(
        markdownContent,
        config.subject,
        config.categories
      );
      subjects.push(subjectData);
    } catch (error) {
      console.error(`Error loading or parsing ${config.subject.id}.md:`, error);
    }
  }
  
  return { subjects };
}

// --- 아래 함수들은 그대로 두면 된다. 내부적으로 새로운 loadAllData를 사용하게 된다. ---

export async function getAllSubjects() {
  const examData = await loadAllData();
  return examData.subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    description: subject.description,
    categoryCount: subject.categories.length
  }));
}

export async function getSubjectData(subjectId: string) {
  const examData = await loadAllData();
  return examData.subjects.find(s => s.id === subjectId) || null;
}

export async function getCategoryData(categoryId: string) {
  const examData = await loadAllData();
  for (const subject of examData.subjects) {
    const category = subject.categories.find(c => c.id === categoryId);
    if (category) {
      return category;
    }
  }
  return null;
}

export async function getAllSubjectCategoryPaths() {
  const examData = await loadAllData();
  return examData.subjects.flatMap(subject => 
    subject.categories.map(category => ({
      subject: subject.id,
      category: category.id
    }))
  );
}