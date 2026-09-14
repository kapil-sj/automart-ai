import AuthForm from '@/app/auth/auth-form'
import { getSafeNextPath } from '@/lib/auth/safe-next-path'

type SignupPageProps = {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams
  return <AuthForm mode="signup" nextPath={getSafeNextPath(params.next)} />
}
