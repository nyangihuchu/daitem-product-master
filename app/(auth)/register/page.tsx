'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z
  .object({
    email: z.string().email('유효한 이메일을 입력하세요'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const ERROR_MESSAGES: Record<string, string> = {
  'User already registered': '이미 가입된 이메일입니다',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다',
}

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [redirectPending, setRedirectPending] = useState(false)

  useEffect(() => {
    if (!redirectPending) return
    const id = setTimeout(() => router.push('/login'), 2000)
    return () => clearTimeout(id)
  }, [redirectPending, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(ERROR_MESSAGES[error.message] ?? '회원가입 중 오류가 발생했습니다')
      return
    }

    setRedirectPending(true)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>회원가입</CardTitle>
        <CardDescription>새 계정을 만드세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-xs">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {serverError && (
            <p className="text-destructive text-sm">{serverError}</p>
          )}
          {redirectPending && (
            <p className="text-sm text-green-600">가입 완료! 이메일 인증 후 로그인해 주세요.</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
