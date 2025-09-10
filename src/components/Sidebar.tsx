"use client";

import { STAKEHOLDER_TYPE } from "@prisma/client";
import {
  EnrichedProjectMaterials,
  FullyEnrichedProject,
} from "@/types/dashboard";
import { Collapse, Tag } from "antd";
const comingSoonStakeholders = [
  {
    key: "1",
    label: STAKEHOLDER_TYPE.ENGINEER,
    children: <div className="text-sm font-light">Coming soon</div>,
  },
  {
    key: "3",
    label: STAKEHOLDER_TYPE.CONTRACTOR,
    children: <div className="text-sm font-light">Coming soon</div>,
  },
];
export function Sidebar({
  materials,
  project,
}: {
  materials: EnrichedProjectMaterials;
  project: FullyEnrichedProject;
}) {
  const MaterialDetails = ({
    certifications,
    url,
    supplierName,
    usedWhere,
    tags,
  }: { certifications: string[], url: string | null, supplierName: string | null, usedWhere: string, tags: string[] }) => {
    const certificationTags = certifications.map((c) => <Tag key={c}>{c}</Tag>);
    const imageTags = tags.join(", ")
    return (
      <>
        <h6 className="text-xs font-semibold mb-1">Where it is used:</h6>
        <p className="mb-2 text-sm font-light">{usedWhere}</p>
        <h6 className="text-xs font-semibold mb-1">Material Categories:</h6>
        <div className="flex flex-wrap">
          <p className="mb-2 text-sm font-light">{imageTags}</p>
        </div>
        {(url === null ? null : <a
          href={`${url}?utm_source=marchmaterials.com&utm_medium=MARCH_material_search_for_architects`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {supplierName}
        </a>)}
        {certificationTags}
      </>
    );
  };
  const materialList = materials.map((m) => ({
    key: m.material.id,
    label: `${m.percentage}% ${m.material.name}`,
    children: (
      <MaterialDetails {...{ usedWhere: m.usedWhere, supplierName: m.material.supplier.name, ...m.material }} />
    ),
  }));
  const stakeholderList = project.stakeholders
    .map((s) => ({
      key: s.id,
      label: s.type[0],
      children: <div className="text-sm font-light">{s.companyName}</div>,
    }))
    .concat(comingSoonStakeholders);
  return (
    <div className="pl-4 pr-4 pb-4">
      <h4 className="text-sm font-light">{project.location}</h4>
      <p className="text-sm font-light">{project.area}sqm</p>
      <p className="text-sm font-light">completed in {project.yearCompleted}</p>
      <h4 className="font-medium mt-4 mb-4">Materials</h4>
      <Collapse items={materialList} />
      <h4 className="font-medium mt-4 mb-4">Stakeholders</h4>
      <Collapse items={stakeholderList} />
      <p className="text-md mt-6">About this project:</p>
      <p className="text-sm font-light mt-2">{project.description}</p>
    </div>
  );
}
