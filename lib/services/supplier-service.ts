import { createClient } from '@/lib/supabase/server'
import type { Supplier, PaymentTerm } from '@/lib/types'

interface GetSuppliersParams {
  search?: string
  paymentTerm?: string
}

interface SupplierInput {
  name: string
  contact_name?: string | null
  contact_phone?: string | null
  payment_term?: PaymentTerm
  lead_time_days?: number | null
  memo?: string | null
}

export async function getSuppliers({ search, paymentTerm }: GetSuppliersParams = {}): Promise<Supplier[]> {
  const supabase = await createClient()

  let query = supabase
    .from('suppliers')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,contact_name.ilike.%${search}%`)
  }

  if (paymentTerm && paymentTerm !== 'all') {
    query = query.eq('payment_term', paymentTerm as PaymentTerm)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as Supplier[]
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: input.name,
      contact_name: input.contact_name ?? null,
      contact_phone: input.contact_phone ?? null,
      payment_term: input.payment_term ?? 'postpaid',
      lead_time_days: input.lead_time_days ?? null,
      memo: input.memo ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Supplier
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.contact_name !== undefined && { contact_name: input.contact_name }),
      ...(input.contact_phone !== undefined && { contact_phone: input.contact_phone }),
      ...(input.payment_term !== undefined && { payment_term: input.payment_term }),
      ...(input.lead_time_days !== undefined && { lead_time_days: input.lead_time_days }),
      ...(input.memo !== undefined && { memo: input.memo }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Supplier
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('suppliers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
