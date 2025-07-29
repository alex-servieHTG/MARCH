"use client";

import ProjectCard from "@/components/ProjectCard";
import { useDataContext } from "@/app/context/dataContext";
import { use, useState } from "react";
import SearchBar from "@/components/SearchBar";

export default function ProjectDashboard() {
  const { filteredProjects, initialProjectsFetch, search } = useDataContext();
  const [loading, setLoading] = useState(false);

  const projectsToShow = search ? filteredProjects : use(initialProjectsFetch);

  if (projectsToShow instanceof Error) {
    console.error("Error fetching projects:", projectsToShow);
    return (
      <p data-testid="error-message">
        Error loading projects. Please try again later.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <SearchBar setLoading={setLoading} />
      {projectsToShow.length === 0 && !loading && (
        <p data-testid="no-results-message">
          No projects found. Try a different search term.
        </p>
      )}
      {loading ? (
        <p data-testid="loading-message">Loading projects...</p>
      ) : (
        <div
          data-testid="project-grid"
          className="flex flex-row m-4 flex-wrap justify-around w-full"
        >
          {projectsToShow.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
