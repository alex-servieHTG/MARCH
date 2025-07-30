"use client";
import { FullyEnrichedProject } from "@/types/dashboard";
import { Card } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProjectCard({
  project,
}: {
  project: FullyEnrichedProject;
}) {
  const router = useRouter();
  const handleClick = () => {
    if (!project.images.length) return;
    router.push(`/dashboard?id=${project.id}`, { scroll: false });
  };

  return (
    <>
      <Card
        key={project.id}
        data-testid={project.id}
        className="max-w-sm cursor-pointer"
        title={project.title}
        onClick={handleClick}
        hoverable
      >
        {Boolean(project.images.length) && (
          <Image
            src={project.images[0].url}
            alt={`image of architectural project titled ${project.title}`}
            width={500}
            height={300}
            className="rounded-lg"
            loading="lazy"
          />
        )}
      </Card>
    </>
  );
}
