import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  ZapIcon,
  ShieldIcon,
  PaletteIcon,
  ServerIcon,
  CodeIcon,
  LayoutDashboardIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Home',
}

const FEATURES = [
  {
    icon: ZapIcon,
    title: 'Next.js 15 App Router',
    description: '최신 App Router, Server Components, Streaming 지원',
  },
  {
    icon: PaletteIcon,
    title: 'Tailwind CSS v4',
    description: 'OKLch 색공간 기반 CSS 변수, 다크 모드 완벽 지원',
  },
  {
    icon: ShieldIcon,
    title: 'TypeScript Strict',
    description: '완전한 타입 안전성, 엄격 모드 설정',
  },
  {
    icon: LayoutDashboardIcon,
    title: 'shadcn/ui radix-nova',
    description: '최신 radix-nova 스타일 컴포넌트 시스템',
  },
  {
    icon: ServerIcon,
    title: 'Server Components',
    description: '서버 우선 아키텍처로 최적의 성능',
  },
  {
    icon: CodeIcon,
    title: 'Developer Experience',
    description: '체계적인 파일 구조, 재사용 가능한 훅과 유틸리티',
  },
] as const

const TECH_STACK = [
  { name: 'Next.js 15', variant: 'default' as const },
  { name: 'React 19', variant: 'default' as const },
  { name: 'TypeScript 5', variant: 'secondary' as const },
  { name: 'Tailwind v4', variant: 'secondary' as const },
  { name: 'shadcn/ui', variant: 'outline' as const },
  { name: 'Radix UI', variant: 'outline' as const },
  { name: 'next-themes', variant: 'outline' as const },
  { name: 'Lucide React', variant: 'outline' as const },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <div className="container mx-auto max-w-3xl px-4">
            <Badge variant="secondary" className="mb-6">
              Next.js 15 + React 19
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              모던 웹 스타터 킷
            </h1>
            <p className="text-muted-foreground mb-10 text-xl leading-relaxed">
              Next.js 15, React 19, Tailwind CSS v4, shadcn/ui로 구성된
              프로덕션 레디 스타터 킷입니다.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">대시보드 보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">시작하기</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/40 py-24">
          <div className="container mx-auto max-w-screen-xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">주요 기능</h2>
              <p className="text-muted-foreground text-lg">
                프로덕션에 필요한 모든 것이 준비되어 있습니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="bg-primary/10 mb-2 flex size-10 items-center justify-center rounded-lg">
                      <feature.icon className="text-primary size-5" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto max-w-screen-xl px-4 text-center">
            <h2 className="mb-8 text-3xl font-bold">기술 스택</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {TECH_STACK.map((tech) => (
                <Badge
                  key={tech.name}
                  variant={tech.variant}
                  className="px-4 py-1.5 text-sm"
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
