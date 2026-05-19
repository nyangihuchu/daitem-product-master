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
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>로그인</CardTitle>
        <CardDescription>계정에 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">비밀번호</Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              비밀번호 찾기
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <Button className="w-full">로그인</Button>
        <Separator />
        <Button variant="outline" className="w-full">
          Google로 계속하기
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-muted-foreground text-sm">
          계정이 없으신가요?{' '}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
