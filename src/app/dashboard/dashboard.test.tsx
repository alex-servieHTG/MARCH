import React from 'react'
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "@/app/dashboard/page";
import { ProjectWithImages } from "@/types/dashboard";
import prisma from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  project: {
    findMany: jest.fn()
  }
}))

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

  beforeEach(() => {
    // @ts-expect-error: Mocking prisma.project.findMany for testing purposes
    prisma.project.findMany.mockResolvedValue(fakeProjects)
  })

  it('should render all projects given', async () => {

    const pageJsx = await Page()
    render(<>{pageJsx}</>)

    // 3) Assert that exactly 5 cards appear
    const cards = await screen.findAllByTestId('project-card')
    expect(cards).toHaveLength(5)
  })
})
