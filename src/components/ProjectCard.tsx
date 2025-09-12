"use client";
import { FullyEnrichedProject } from "@/types/dashboard";
import { useCallback, useState } from "react";
import { Card } from "antd";
import Image from "next/image";
import Lightbox from "./Lightbox";
import VoteButton from "./VoteButton";

export default function ProjectCard({
  project,
}: {
  project: FullyEnrichedProject;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [voteCount, setVoteCount] = useState(project.votes);
  const [loading, setLoading] = useState(true);

  const titleImage = project.images.find((i) =>
    i.aiTags.includes("title-image")
  );

  return (
    <>
      <Card
        key={project.id}
        data-testid={project.id}
        className="w-[350px] sm:w-[400px] max-h-fit cursor-pointer !mb-2"
        title={project.title}
        onClick={() => setLightboxOpen(true)}
        hoverable
        loading={loading}
        cover={
          Boolean(project.images.length) && (
            <Image
              src={titleImage?.url ?? project.images[0].url}
              alt={`image of architectural project titled ${project.title}`}
              width={400}
              height={300}
              layout="responsive"
              loading="lazy"
              className="!rounded-none"
              onLoad={() => setLoading(false)}
            />
          )
        }
      >
        <div className="flex flex-row justify-between items-center">
          <div className="text-sm text-gray-700">Votes: {voteCount}</div>
          <VoteButton projectId={project.id} setVotes={setVoteCount} antdAdjustment={false}></VoteButton>
        </div>
      </Card>
      <Lightbox
        images={project.images.map((img) => img.url)}
        materials={[...project.projectMaterial.map((m) => m)]}
        title={project.title}
        project={project}
        votes={voteCount}
        setVotes={setVoteCount}
        open={lightboxOpen}
        onClose={useCallback(() => setLightboxOpen(false), [])}
      />
    </>
  );

}
