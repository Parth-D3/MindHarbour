import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MindHarbourApp from "./MindHarbourApp";
import ScraperPage from "./ScraperPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MindHarbourApp />,
  },
  {
    path: "/scraper",
    element: <ScraperPage />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

