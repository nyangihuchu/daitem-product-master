import { Resend } from 'resend'

interface SendPurchaseEmailInput {
  to: string
  purchaseId: string
  pdfBuffer: Buffer
}

export async function sendPurchaseEmail({
  to,
  purchaseId,
  pdfBuffer,
}: SendPurchaseEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다')

  const from =
    process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `[DAITEM] Purchase Order - ${purchaseId}`,
    html: `<p>발주서를 첨부합니다.</p><p>발주 번호: <strong>${purchaseId}</strong></p>`,
    attachments: [
      {
        filename: `purchase-${purchaseId}.pdf`,
        content: pdfBuffer,
      },
    ],
  })

  if (error) throw new Error(error.message)
}
