// Tests all the parts of the upload component
// 1. Test if no files are submitted
// 2. Test submit button while files are uploading

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "./page";
import { ImageUploader } from "./page";

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
jest.mock("../../components/navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

// This is where people will upload all the pictures of their submission
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

  // if there are no files uploaded, there will be an error when sumbitting
  it("shows error if submitting with no files", async () => {
    render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: /submit images/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/please upload at least one image/i)
      ).toBeInTheDocument()
    );
  });

  // hides navbar so users can not move away from page while uploading
  it("does not render navbar so user cannot navigate away", () => {
    render(<Page />);
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument();
  });
});

// while files are uploading, the sumbit button is disabled
describe("ImageUploade", () => {
  it("submit button is disabled when loading is true", () => {
    const mockUploadState = { loading: true, setLoading: jest.fn() };
    render(<ImageUploader uploadState={mockUploadState} />);
    expect(
      screen.getByRole("button", { name: /submit images/i })
    ).toBeDisabled();
  });
});

// test error messages
