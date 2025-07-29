import { render, screen } from "@testing-library/react";
import ProjectDashboard from "./ProjectDashboard";
import { useDataContext } from "@/app/context/dataContext";
import { FullyEnrichedProject } from "@/types/dashboard";
import React from "react";
import { generateProject } from "@/tests/generators";

// Mock the context
jest.mock("@/app/context/dataContext", () => ({
  useDataContext: jest.fn(),
}));

jest.mock("react", () => {
  const ActualReact = jest.requireActual("react");
  return {
    ...ActualReact,
    use: jest.fn(() => []),
    useState: jest.fn((state) => [state, jest.fn()]),
  };
});

describe("ProjectDashboard", () => {
  let mockProjects: FullyEnrichedProject[];

  beforeEach(() => {
    mockProjects = [generateProject(), generateProject()];

    (useDataContext as jest.Mock).mockReturnValue({
      filteredProjects: [],
      initialProjectsFetch: Promise.resolve(mockProjects),
      search: "",
    });
  });

  it("renders the dashboard", () => {
    render(<ProjectDashboard />);
    console.log();
    expect(screen.getByTestId("project-grid")).toBeInTheDocument();
  });

  it("shows loading message when loading is true", () => {
    // Simulate loading state
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [true, () => jest.fn()]);
    render(<ProjectDashboard />);
    expect(screen.getByTestId("loading-message")).toBeInTheDocument();
  });

  it("shows error message if projectsToShow is an Error", () => {
    jest.spyOn(React, "use").mockReturnValueOnce(new Error("fail"));
    render(<ProjectDashboard />);
    expect(screen.getByTestId("error-message")).toBeInTheDocument();
  });

  it("shows no projects message when search return no results", () => {
    (useDataContext as jest.Mock).mockReturnValue({
      filteredProjects: [],
      search: "test search",
    });
    render(<ProjectDashboard />);
    expect(screen.getByTestId("no-results-message")).toBeInTheDocument();
  });

  it("renders project cards when projects are present", async () => {
    (useDataContext as jest.Mock).mockReturnValue({
      filteredProjects: mockProjects,
      search: "test search",
    });
    const firstProject = mockProjects[0];
    const secondProject = mockProjects[1];
    render(<ProjectDashboard />);
    expect(await screen.findByTestId(firstProject.id)).toBeInTheDocument();
    expect(await screen.findByTestId(secondProject.id)).toBeInTheDocument();
  });
});
