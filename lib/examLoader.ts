// lib/examLoader.ts (이 코드로 전체를 교체)

import { promises as fs } from 'fs'
import path from 'path'
import { parseSubjectData, parseChoiceQuizData } from './examData'
import { ExamData, Subject } from '@/types/exam'
import { subjectsConfig } from '@/content'

let cachedExamData: ExamData | null = null;

export async function loadAllData(): Promise<ExamData> {
  if (process.env.NODE_ENV === 'development') {
    return await fetchAllSubjects();
  }
  if (cachedExamData) {
    return cachedExamData;
  }
  cachedExamData = await fetchAllSubjects();
  return cachedExamData;
}

async function fetchAllSubjects(): Promise<ExamData> {
  const subjects: Subject[] = [];

  for (const config of subjectsConfig) {
    const markdownPath = path.join(process.cwd(), `content/${config.subject.id}.md`);
    try {
      const markdownContent = await fs.readFile(markdownPath, 'utf-8');
      
      let subjectData: Subject;

      if (config.subject.id === 'bioethics') {
        subjectData = parseChoiceQuizData(
          markdownContent,
          // ✅ 해결: config.subject가 Subject 타입임을 컴파일러에게 확신시켜준다.
          config.subject as Subject 
        );
      } else {
        subjectData = parseSubjectData(
          markdownContent,
          config.subject,
          config.categories
        );
      }
      
      subjects.push(subjectData);
    } catch (error) {
      console.error(`Error loading or parsing ${config.subject.id}.md:`, error);
    }
  }
  
  return { subjects };
}


// --- 아래 함수들은 수정할 필요 없음 ---

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