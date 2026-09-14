import AuthForm from '@/app/auth/auth-form'
import { getSafeNextPath } from '@/lib/auth/safe-next-path'

type LoginPageProps = {
  searchParams: Promise<{ signup?: string | string[]; next?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextPath = getSafeNextPath(params.next)
  const notice = params.signup === 'success'
    ? 'Your account is ready. Check your inbox if email confirmation is enabled, then sign in.'
    : undefined

  return <AuthForm mode="login" notice={notice} nextPath={nextPath} />
}
