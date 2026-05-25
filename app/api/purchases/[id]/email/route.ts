import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { createElement } from 'react'
import { getPurchase } from '@/lib/services/purchase-service'
import { sendPurchaseEmail } from '@/lib/services/email-service'
import { PurchaseDocument } from '@/lib/pdf/purchase-document'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.to || typeof body.to !== 'string') {
      return NextResponse.json({ error: '수신 이메일 주소를 입력하세요' }, { status: 400 })
    }

    const purchase = await getPurchase(id)

    const element = createElement(
      PurchaseDocument,
      { purchase }
    ) as unknown as ReactElement<DocumentProps>

    const buffer = await renderToBuffer(element)

    await sendPurchaseEmail({
      to: body.to,
      purchaseId: id,
      pdfBuffer: buffer as unknown as Buffer,
    })

    return NextResponse.json({ message: '이메일이 발송되었습니다' })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
