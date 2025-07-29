import { render, screen } from "@testing-library/react";
import ProjectCard from "./ProjectCard.tsx";
import { generateImage, generateProject } from "@/tests/generators";
import { FullyEnrichedProject } from "@/types/dashboard";

describe("ProjectCard", () => {
  let project: FullyEnrichedProject;

  beforeEach(() => {
    project = generateProject();
  });

  it("renders the project card", () => {
    render(<ProjectCard project={project} />);
    const projectCard = screen.getByTestId(project.id);
    expect(projectCard).toBeInTheDocument();
  });

  it("renders the first project image", () => {
    project.images.push(generateImage({ projectId: project.id }));
    render(<ProjectCard project={project} />);
    const imageDisplayed = screen.getByRole("img");
    expect(imageDisplayed.getAttribute("src")?.includes(project.images[0].url));
  });
});
