import { NextResponse, type NextRequest } from 'next/server'
import { calculateMargin } from '@/lib/services/margin-service'
import { getCurrentFees } from '@/lib/services/market-fee-service'
import type { MarketChannel } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sellingPriceRaw = searchParams.get('selling_price')
    const purchasePriceRaw = searchParams.get('purchase_price')

    if (!sellingPriceRaw || !purchasePriceRaw) {
      return NextResponse.json(
        { error: 'selling_price와 purchase_price는 필수입니다' },
        { status: 400 },
      )
    }

    const sellingPrice = Number(sellingPriceRaw)
    const purchasePrice = Number(purchasePriceRaw)

    if (isNaN(sellingPrice) || isNaN(purchasePrice)) {
      return NextResponse.json({ error: '가격은 숫자여야 합니다' }, { status: 400 })
    }

    let feeRate = 0
    const channelParam = searchParams.get('channel')
    const feeRateParam = searchParams.get('fee_rate')

    if (channelParam) {
      const fees = await getCurrentFees()
      const found = fees.find((f) => f.market_name === (channelParam as MarketChannel))
      feeRate = found?.fee_rate ?? 0
    } else if (feeRateParam) {
      feeRate = Number(feeRateParam)
    }

    const shippingFee = searchParams.get('shipping_fee') ? Number(searchParams.get('shipping_fee')) : undefined
    const returnCost = searchParams.get('return_cost') ? Number(searchParams.get('return_cost')) : undefined
    const adCost = searchParams.get('ad_cost') ? Number(searchParams.get('ad_cost')) : undefined

    const result = calculateMargin({ sellingPrice, purchasePrice, feeRate, shippingFee, returnCost, adCost })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
