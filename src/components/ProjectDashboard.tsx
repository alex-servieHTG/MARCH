"use client";

import ProjectCard from "@/components/ProjectCard";
import { useDataContext } from "@/app/context/dataContext";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Masonry from "react-masonry-css";

export default function ProjectDashboard() {
  const { filteredProjects, allProjects, search } = useDataContext();
  const [loading, setLoading] = useState(false);

  const projectsToShow = search ? filteredProjects : allProjects;

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
        <Masonry
          data-testid="project-grid"
          breakpointCols={{ default: 3, 1300: 2, 900: 1 }}
          className="flex w-auto m-4"
          columnClassName="sm:pl-4 bg-clip-padding"
        >
          {projectsToShow.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </Masonry>
      )}
    </div>
  );
}
