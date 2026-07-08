import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders WebChamp landing page", () => {
  render(<App />);
  expect(screen.getAllByText(/WebChamp Interview Coach/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Build practice session/i)).toBeInTheDocument();
});
