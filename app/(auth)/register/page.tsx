import type { Metadata } from 'next'
import Link from 'next/link'
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
}from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Register',
}

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>회원가입</CardTitle>
        <CardDescription>새 계정을 만드세요</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">이름</Label>
            <Input id="firstName" placeholder="길동" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">성</Label>
            <Input id="lastName" placeholder="홍" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
        </div>
        <Button className="w-full">회원가입</Button>
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
