import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "@/app/dashboard/page";

jest.mock("@/lib/prisma");

describe('dashboard', () => {
    it('should be wrapped in flex', async () =>{
        const element = await Page();
        
        render(element);

        const grid = screen.getByTestId("project-grid");
        expect(grid).toHaveClass("flex");
    })
})
