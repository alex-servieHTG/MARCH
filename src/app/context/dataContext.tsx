"use client";

import { createContext, useContext, useState } from "react";
import { FullyEnrichedProject } from "@/types/dashboard";

type DataContext = {
  filteredProjects: Array<FullyEnrichedProject>;
  setFilteredProjects: React.Dispatch<
    React.SetStateAction<Array<FullyEnrichedProject>>
  >;
  allProjects: Array<FullyEnrichedProject>,
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

const DataContext = createContext<DataContext>({
  filteredProjects: [],
  setFilteredProjects: () => ({}),
  allProjects: [],
  search: "",
  setSearch: () => "",
});

export function DataProvider({
  children,
  initialProjects,
}: {
  children: React.ReactNode;
  initialProjects: Array<FullyEnrichedProject>;
}) {
  const [filteredProjects, setFilteredProjects] = useState<
    Array<FullyEnrichedProject>
  >([]);
  const [search, setSearch] = useState<string>("");
  return (
    <DataContext.Provider
      value={{
        filteredProjects,
        setFilteredProjects,
        allProjects: initialProjects,
        search,
        setSearch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  return useContext(DataContext);
}
