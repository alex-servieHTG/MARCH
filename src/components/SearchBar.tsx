"use client";

import { useDataContext } from "@/app/context/dataContext";
import { useState } from "react";
import searchProjects from "@/utils/search";

export default function SearchBar({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) {
  const { setFilteredProjects, setSearch, allProjects } = useDataContext();
  const [searchText, setSearchText] = useState("");

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchText);
    if (!searchText) return;
    setLoading(true);

    console.log(`allProjects.length=${allProjects.length}`)
    const filteredProjects = searchProjects(allProjects, searchText)
    console.log(`filteredProjects.length=${filteredProjects.length}`)
    setFilteredProjects(filteredProjects);
    setLoading(false);
  };
  return (
    <search className="w-4/5">
      <form onSubmit={onSearch}>
        <div className="flex items-stretch">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            type="search"
            placeholder="search projects by name, architect, material name, or material category"
            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2
                     focus:outline-none focus:ring-1 focus:ring-black/30 focus:border-black"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-r-md border border-l-0 border-gray-300
                     bg-black text-white px-3
                     hover:opacity-75 hover:border-opacity-75
                     focus:outline-none focus:ring-2 focus:ring-black/30"
            aria-label="Search"
            title="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </form>
    </search>
  );

}
