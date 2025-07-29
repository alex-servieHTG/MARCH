import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "./SearchBar";
import { useDataContext } from "@/app/context/dataContext";
import { searchProjects } from "@/utils/dashboard";
import { generateProject } from "@/tests/generators";

// Mock dependencies
jest.mock("@/app/context/dataContext", () => ({
  useDataContext: jest.fn(),
}));
jest.mock("@/utils/dashboard", () => ({
  searchProjects: jest.fn(),
}));

describe("SearchBar", () => {
  const setFilteredProjects = jest.fn();
  const setSearch = jest.fn();
  const setLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDataContext as jest.Mock).mockReturnValue({
      setFilteredProjects,
      setSearch,
    });
  });

  it("sets search term and calls searchProjects", async () => {
    (searchProjects as jest.Mock).mockResolvedValue([]);
    render(<SearchBar setLoading={setLoading} />);
    const input = screen.getByTestId("search-bar");
    const button = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Modern House" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(setSearch).toHaveBeenCalledWith("Modern House");
      expect(searchProjects).toHaveBeenCalledWith({
        searchTerm: "Modern House",
      });
    });
  });

  it("updates filtered projects on search", async () => {
    const project = generateProject();
    (searchProjects as jest.Mock).mockResolvedValue([project]);

    render(<SearchBar setLoading={setLoading} />);
    const input = screen.getByTestId("search-bar");
    const button = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "Jane Doe" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(setFilteredProjects).toHaveBeenCalledWith([project]);
    });
  });

  it("preserves search term after search", async () => {
    const searchTerm = "ABC Architects";

    render(<SearchBar setLoading={setLoading} />);
    const input = screen.getByTestId("search-bar");
    fireEvent.change(input, { target: { value: searchTerm } });
    const button = screen.getByRole("button");
    fireEvent.click(button);

    const inputAfterSearch = screen.getByTestId("search-bar");

    await waitFor(() => {
      expect(inputAfterSearch).toHaveValue(searchTerm);
    });
  });
});
