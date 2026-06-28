import dynamic from 'next/dynamic'
import HomeExperienceV2 from '@/components/home/v2/HomeExperienceV2'
import { getHomeData } from '@/lib/home-data'

// V1 is flag-gated (/?v=1) — lazy-loaded so it never enters the V2 bundle
const HomeExperience = dynamic(() => import('@/components/home/HomeExperience'))

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: { v?: string }
}) {
  const data = await getHomeData()
  if (searchParams.v === '1') return <HomeExperience {...data} />
  return <HomeExperienceV2 {...data} />
}
