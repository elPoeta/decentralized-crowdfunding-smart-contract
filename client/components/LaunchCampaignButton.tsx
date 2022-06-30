import Link from "next/link"

export const LaunchCampaignButton = () => {
  return (
    <div>
      <Link href='/launch'><a className="rounded-full border-2 border-blue-500 p-1 w-[80px]">launch</a></Link>
    </div>
  )
}
