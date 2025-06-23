import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "./page";

jest.mock("@imagekit/next", () => ({
  upload: jest.fn(),
}));
jest.mock("../actions/upload", () => ({
  generateImagekitSignature: jest.fn().mockResolvedValue({
    expire: "123",
    token: "token",
    signature: "sig",
  }),
}));
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "email") return "test@example.com";
      if (key === "project") return "Test Project";
      return null;
    },
  }),
}));

jest.mock("../../components/NavBar.tsx", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

describe("/upload page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the upload form", () => {
    render(<Page />);
    expect(
      screen.getByText(/The Final Step! Upload all images/i)
    ).toBeInTheDocument();
  });

  it("shows error if submitting with no files", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /submit images/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/please upload at least one image/i)
      ).toBeInTheDocument()
    );
  });

  it("does not render navbar so user cannot navigate away", () => {
    render(<Page />);
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });
});

// describe("before submission error message handling", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("shows error if no title image is selected", async () => {
//     render(<Page />);

//     const input = screen.getByTestId("mock-upload-input");
//     const file = new File(["test"], "image.jpg", { type: "image/jpeg" });

//     fireEvent.change(input, { target: { files: [file] } });

//     await waitFor(() =>
//       expect(screen.getByText(/uploaded successfully/i)).toBeInTheDocument()
//     );

//     fireEvent.click(screen.getByRole("button", { name: /submit images/i }));

//     expect(
//       await screen.findByText(/please select a file to be the title image/i)
//     ).toBeInTheDocument();
//   });
// });
