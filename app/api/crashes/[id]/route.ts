import { NextRequest, NextResponse } from 'next/server'
import { getCrash } from '@/lib/store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const crash = await getCrash(id)
  if (!crash) {
    return NextResponse.json({ error: 'Crash report not found' }, { status: 404 })
  }
  return NextResponse.json(crash)
}
