"use client";
import { ProjectWithImages } from "@/types/dashboard";
import { useCallback, useState } from "react";
import { Card } from "antd";
import Image from "next/image";
import Lightbox from "./Lightbox";
import { imageKitLoader } from "@/utils/imageKit";

export default function DashboardProjects({
  project,
}: {
  project: ProjectWithImages;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <Card
        //added this for testing...maybe remove later?
        data-testid="project-card"
        key={project.id}
        className="max-w-sm cursor-pointer"
        title={project.title}
        onClick={() => project.images.length && setLightboxOpen(true)}
        hoverable
      >
        {Boolean(project.images.length) && (
          <Image
            loader={() =>
              imageKitLoader({
                src: project.images[0].url,
                height: 280,
                width: 400,
              })
            }
            src={project.images[0].url}
            alt={`image of architectural project titled ${project.title}`}
            width={500}
            height={300}
            className="rounded-lg"
            loading="lazy"
          />
        )}
      </Card>
      <Lightbox
        images={project.images.map((img) => img.url)}
        open={lightboxOpen}
        onClose={useCallback(() => setLightboxOpen(false), [])}
      />
    </>
  );
}
