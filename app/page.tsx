import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Benefits } from '@/components/Benefits'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar user={user} />
      <main className="flex-1">
        <Hero user={user} />
        <Features />
        <Benefits />
        <CTA user={user} />
      </main>
      <Footer />
    </div>
  )
}
