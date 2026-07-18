import HomeExperienceV2 from '@/components/home/v2/HomeExperienceV2'
import { getHomeData } from '@/lib/home-data'

export const revalidate = 60

export default async function HomePage() {
  const data = await getHomeData()
  return <HomeExperienceV2 {...data} />
}
