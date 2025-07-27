import { promises as fs } from 'fs'
import path from 'path'
import { parseExamData } from './examData'
import { ExamData } from '@/types/exam'

let cachedExamData: ExamData | null = null

/**
 * exam.mdファイルを読み込んでパースされたデータを返す
 */
export async function loadExamData(): Promise<ExamData> {
  if (cachedExamData) {
    return cachedExamData
  }
  
  try {
    const filePath = path.join(process.cwd(), 'exam.md')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    cachedExamData = parseExamData(fileContent)
    return cachedExamData
  } catch (error) {
    console.error('Error loading exam data:', error)
    // フォールバック: 空のデータを返す
    return { categories: [] }
  }
}

/**
 * 特定のカテゴリのデータを取得
 */
export async function getCategoryData(categoryId: string) {
  const examData = await loadExamData()
  return examData.categories.find(category => category.id === categoryId)
}

/**
 * 全カテゴリのリストを取得
 */
export async function getAllCategories() {
  const examData = await loadExamData()
  return examData.categories.map(category => ({
    id: category.id,
    name: category.name,
    nameEn: category.nameEn,
    description: category.description,
    questionCount: category.questionCount
  }))
} 