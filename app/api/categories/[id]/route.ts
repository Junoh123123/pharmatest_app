import { NextRequest, NextResponse } from 'next/server'
import { getCategoryData } from '@/lib/examLoader'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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