// 파일 위치: app/api/categories/[id]/route.ts (이 코드로 교체)

import { NextRequest, NextResponse } from 'next/server'
import { getCategoryData } from '@/lib/examLoader'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
) {
  try {
    const { id: categoryId } = await params;
    const categoryData = await getCategoryData(categoryId);
    
    if (!categoryData) {
      return NextResponse.json(
        { error: 'Category not found with ID: ' + categoryId },
        { status: 404 }
      )
    }

    // 서버 터미널에 로그를 남겨서 디버깅을 돕는다.
    console.log(`[API] Category: ${categoryData.name}, Questions found: ${categoryData.questions.length}`);

    return NextResponse.json(categoryData);

  } catch (error) {
    console.error(`[API Error] Error fetching category data for ID:`, error);
    return NextResponse.json(
      { error: 'Internal server error while fetching category.' },
      { status: 500 }
    )
  }
}