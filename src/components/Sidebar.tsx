"use client";

import { ProjectMaterial, Material } from "@prisma/client";
import {
  EnrichedProjectMaterials,
  FullyEnrichedProject,
} from "@/types/dashboard";
import { Collapse, Tag } from "antd";

export function Sidebar({
  materials,
  project,
}: {
  materials: EnrichedProjectMaterials;
  project: FullyEnrichedProject;
}) {
  console.log("material", materials[0]);
  const MaterialDetails = ({
    certifications,
    url,
    usedWhere,
  }: Material & Partial<ProjectMaterial>) => {
    const certificationTags = certifications.map((c) => <Tag key={c}>{c}</Tag>);
    return (
      <>
        <h6 className="text-xs font-semibold mb-1">Where it is used:</h6>
        <p className="mb-2">{usedWhere}</p>
        <a
          href={`${url}?utm_source=marchmaterials.com&utm_medium=MARCH_material_search_for_architects`}
          rel="noopener noreferrer"
          target="_blank"
        >
          Go to supplier
        </a>
        {certificationTags}
      </>
    );
  };
  const items = materials.map((m) => ({
    key: m.material.id,
    label: m.material.name,
    children: (
      <MaterialDetails {...{ usedWhere: m.usedWhere, ...m.material }} />
    ),
  }));
  return (
    <div className="pl-4 pr-4 pb-4">
      <h4 className="text-sm font-light">
        {project.location.city}, {project.location.country}
      </h4>
      <p className="text-sm font-light">{project.area}sqm</p>
      <p className="text-sm font-light">Completed in {project.yearCompleted}</p>
      <h4 className="font-medium mt-4 mb-4">Materials</h4>
      <Collapse items={items} />
      <p className="text-md mt-6">About this project:</p>
      <p className="text-sm font-light mt-2">{project.description}</p>
    </div>
  );
}
