import { type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import { createElement } from 'react'
import { getPurchase } from '@/lib/services/purchase-service'
import { PurchaseDocument } from '@/lib/pdf/purchase-document'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const purchase = await getPurchase(id)

    const element = createElement(
      PurchaseDocument,
      { purchase }
    ) as unknown as ReactElement<DocumentProps>

    const buffer = await renderToBuffer(element)

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="purchase-${id}.pdf"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return Response.json({ error: message }, { status: 500 })
  }
}
