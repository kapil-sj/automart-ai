export default function EnvTestPage() {
  return (
    <main>
      <p>NEXT_PUBLIC_SUPABASE_URL: {String(Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL))}</p>
      <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {String(Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY))}</p>
    </main>
  )
}
