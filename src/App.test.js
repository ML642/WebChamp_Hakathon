import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Answerly landing page", () => {
  render(<App />);
  expect(screen.getAllByText(/Answerly/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Build practice session/i)).toBeInTheDocument();
});
