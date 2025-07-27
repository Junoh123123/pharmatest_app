// 파일 위치: app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCategoryData } from '@/lib/examLoader'

export async function GET(
  request: NextRequest,
  // Next.js 버전에 따라 params가 Promise일 수 있으므로, 타입을 Promise로 지정합니다.
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 에러 메시지의 지침대로, params를 await으로 기다린 후 사용합니다.
    const { id: categoryId } = await params
    const categoryData = await getCategoryData(categoryId)
    
    if (!categoryData) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoryData)
  } catch (error) {
    console.error('Error fetching category data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}