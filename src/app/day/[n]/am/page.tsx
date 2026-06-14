import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/progress";
import { getDay, TOTAL_DAYS } from "@/content/days";
import AMFlow from "@/components/AMFlow";

export const dynamic = "force-dynamic";

export default async function DayAMPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { n } = await params;
  const day = Number(n);
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) notFound();

  const content = getDay(day);
  if (!content) notFound();

  // No skipping ahead: can train any day up to the current one.
  const progress = await getProgress(session.userId);
  const maxOpen = progress.completedAt ? TOTAL_DAYS : progress.currentDay;
  if (day > maxOpen) redirect("/me");

  return <AMFlow day={content} />;
}
