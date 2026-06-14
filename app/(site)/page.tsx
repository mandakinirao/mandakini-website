import HomeExperience from '@/components/home/HomeExperience'
import HomeExperienceV2 from '@/components/home/v2/HomeExperienceV2'
import { getHomeData } from '@/lib/home-data'

export const revalidate = 60

/**
 * V2 ("the poster") is the site. The earlier V1 direction is kept at
 * /?v=1 for reference only and will be deleted once sign-off is final.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: { v?: string }
}) {
  const data = await getHomeData()
  if (searchParams.v === '1') return <HomeExperience {...data} />
  return <HomeExperienceV2 {...data} />
}
