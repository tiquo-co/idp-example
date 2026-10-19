import { Suspense } from "react";

import { PageLoading } from "@/components/page-loading";
import { ProfileView } from "@/components/profile-view";
import { SignedOutHero } from "@/components/signed-out-hero";
import { getSession } from "@/lib/session";

async function HomeContent() {
  const session = await getSession();
  if (!session?.user || session.error) {
    return <SignedOutHero sessionEnded={Boolean(session?.error)} />;
  }
  return <ProfileView user={session.user} tiquo={session.tiquo} />;
}

// The page depends on the session, so it streams in behind a boundary.
export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent />
    </Suspense>
  );
}
