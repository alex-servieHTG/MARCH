import ProjectDashboard from "@/components/ProjectDashboard";
import { Suspense } from "react";

export default function Page() {
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
