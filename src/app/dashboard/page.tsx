import prisma from "@/lib/prisma";
import { ProjectWithImages } from "@/types/dashboard";
import ProjectCard from "@/components/ProjectCard";

export default async function Page() {
  const projects: Array<ProjectWithImages> = await prisma.project.findMany({
    include: { images: true },
  });
  return (
    <div className="min-h-screen">
      <div className="m-4">
        <div 
          data-testid="project-grid" 
          className="flex flex-row m-4 flex-wrap justify-around"
        >
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
