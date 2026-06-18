import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { TOTAL_DAYS } from "@/content/days";
import HAIFlow from "@/components/HAIFlow";

export const dynamic = "force-dynamic";

export default async function HAIPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Determine phase: post if Day 7 PM is complete, otherwise pre
  const progress = await getProgress(session.userId);
  const phase = progress.completedAt ? "post" : "pre";

  return <HAIFlow phase={phase} />;
}
