import { getHomeData } from "@/app/actions";
import Home from "@/components/Home";

export const dynamic = "force-dynamic";

export default async function Page() {
  let data;
  try {
    data = await getHomeData();
  } catch {
    return <Home leaderboard={[]} totalVolume={0} recentActivity={[]} unavailable />;
  }
  return <Home {...data} />;
}
