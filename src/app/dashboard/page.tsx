import ProjectDashboard from "@/components/ProjectDashboard";
import { Suspense } from "react";
import { unstable_noStore as noStore } from 'next/cache';

export const revalidate = 0;            // disable ISR for everything under this layout
export const dynamic = "force-dynamic"; // force per-request SSR

export default async function Page() {
  await noStore()
  return (
    <div className="min-h-screen">
      <div className="m-4">

        <Suspense fallback={<p>loading projects...</p>}>
          <ProjectDashboard />
        </Suspense>

      </div>
    </div>
  );
}
