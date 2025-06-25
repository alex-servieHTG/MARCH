import React from 'react'
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProjectWithImages } from "@/types/dashboard";
import DashboardProjects from "@/components/ProjectCard";

describe('dashboard', () => {
  const fakeProjects: ProjectWithImages[] = Array.from({ length: 5 }, (_, i) => ({
    id: `proj-${i}`,
    createdAt: new Date(),
    title: `Project ${i}`,
    description: `Desc ${i}`,
    location: `Location ${i}`,
    yearCompleted: 2020 + i,
    typology: "RESIDENTIAL", 
    authorEmail: `author${i}@example.com`,
    selectedForCompetition: false,
    area: 100 + i,
    images: []
  }))

  describe("DashboardProjects card", () => {
    it("renders one card per project", () => {
      render(
        <>
          {fakeProjects.map((project) => (
            <DashboardProjects project={project} key={project.id} />
          ))}
        </>
      );

      const cards = screen.getAllByTestId("project-card");
      expect(cards).toHaveLength(fakeProjects.length);
    });
  });
})


