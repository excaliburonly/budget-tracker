import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Navbar } from '@/components/home/Navbar'
import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { Benefits } from '@/components/home/Benefits'
import { CTA } from '@/components/home/CTA'
import { Footer } from '@/components/home/Footer'

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
