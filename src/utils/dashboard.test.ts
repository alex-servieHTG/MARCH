import { searchProjects } from "./dashboard";
import prisma from "@/lib/prisma";

// Mock prisma.project.findMany
jest.mock("@/lib/prisma", () => ({
  project: {
    findMany: jest.fn(),
  },
}));

describe("searchProjects", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("searches by non case sensitive project title", async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
    await searchProjects({ searchTerm: "Modern House" });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              title: expect.objectContaining({
                contains: "Modern House",
                mode: "insensitive",
              }),
            }),
          ]),
        }),
      })
    );
  });

  it("searches by non case sensitive stakeholder name", async () => {
    (prisma.project.findMany as jest.Mock).mockResolvedValue([]);
    await searchProjects({ searchTerm: "Jane Doe" });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              stakeholders: expect.objectContaining({
                some: expect.objectContaining({
                  companyName: expect.objectContaining({
                    contains: "Jane Doe",
                    mode: "insensitive",
                  }),
                }),
              }),
            }),
          ]),
        }),
      })
    );
  });
});
