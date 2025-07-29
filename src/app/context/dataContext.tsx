"use client";

import { createContext, useContext, useState } from "react";
import { FullyEnrichedProject } from "@/types/dashboard";

type DataContext = {
  filteredProjects: Array<FullyEnrichedProject>;
  setFilteredProjects: React.Dispatch<
    React.SetStateAction<Array<FullyEnrichedProject>>
  >;
  initialProjectsFetch: Promise<Array<FullyEnrichedProject> | Error>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
};

const DataContext = createContext<DataContext>({
  filteredProjects: [],
  setFilteredProjects: () => ({}),
  initialProjectsFetch: Promise.resolve([]),
  search: "",
  setSearch: () => "",
});

export function DataProvider({
  children,
  initialProjectsFetch,
}: {
  children: React.ReactNode;
  initialProjectsFetch: Promise<Array<FullyEnrichedProject> | Error>;
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
        initialProjectsFetch,
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
