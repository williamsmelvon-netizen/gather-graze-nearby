import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { getHomeData, listRecipes, getCuisine, getRecipe } from "@/lib/recipes.functions";
import { listSources, getListIngredients } from "@/lib/sources.functions";

// Server functions are mocked so tests exercise the pages' loading, error and
// retry behavior without a network or database.
vi.mock("@/lib/recipes.functions", () => ({
  getHomeData: vi.fn(),
  listRecipes: vi.fn(),
  getCuisine: vi.fn(),
  getRecipe: vi.fn(),
  saveList: vi.fn(),
}));
vi.mock("@/lib/sources.functions", () => ({
  listSources: vi.fn(),
  getListIngredients: vi.fn(),
}));
vi.mock("@/lib/geocode.functions", () => ({
  geocodeAddress: vi.fn(),
}));
// Leaflet needs a real browser; the map is irrelevant to loading/error behavior.
vi.mock("@/components/PlacesMap", () => ({ default: () => null }));

const homeData = vi.mocked(getHomeData);
const recipesData = vi.mocked(listRecipes);
const cuisineData = vi.mocked(getCuisine);
const recipeData = vi.mocked(getRecipe);
const sourcesData = vi.mocked(listSources);
const listIngredients = vi.mocked(getListIngredients);

const cuisine = { id: "c1", name: "Soul Food", description: "Detroit classics", sort_order: 1 };
const recipeCard = {
  id: "r1",
  title: "Collard Greens",
  description: "Slow simmered",
  servings: 4,
  prep_minutes: 10,
  cook_minutes: 40,
  tags: [],
  cuisines: { name: "Soul Food" },
};
const recipeFull = {
  ...recipeCard,
  steps: ["Wash greens", "Simmer"],
  status: "published",
  cuisine_id: "c1",
  created_at: "2026-01-01",
};
const ingredient = { id: "i1", recipe_id: "r1", name: "collard greens", quantity: 1, unit: "bunch", is_pantry: false };
const source = {
  id: "s1",
  name: "Eastern Market",
  type: "farmers_market",
  address: "2934 Russell St",
  lat: 42.348,
  lng: -83.04,
  double_up: true,
  accepts_snap: true,
  verified_on: "2026-10-24",
};

async function renderRoute(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Element.prototype.scrollIntoView = () => {};
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("Home page", () => {
  it("loads cuisines, featured meals and produce through the server function", async () => {
    homeData.mockResolvedValue({ cuisines: [cuisine], featured: [recipeCard], inSeason: [{ name: "kale" }] } as never);

    await renderRoute("/");

    expect(await screen.findByText("Collard Greens")).toBeInTheDocument();
    expect(screen.getByText("kale")).toBeInTheDocument();
    expect(homeData).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    homeData.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load meals right now.");

    homeData.mockResolvedValue({ cuisines: [cuisine], featured: [recipeCard], inSeason: [] } as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Collard Greens")).toBeInTheDocument();
    expect(homeData).toHaveBeenCalledTimes(2);
  });
});

describe("All recipes page", () => {
  it("loads every meal through the server function", async () => {
    recipesData.mockResolvedValue({ recipes: [recipeCard], cuisines: [cuisine] } as never);

    await renderRoute("/recipes");

    expect(await screen.findByText("Collard Greens")).toBeInTheDocument();
    expect(recipesData).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    recipesData.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/recipes");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load recipes");

    recipesData.mockResolvedValue({ recipes: [recipeCard], cuisines: [cuisine] } as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Collard Greens")).toBeInTheDocument();
    expect(recipesData).toHaveBeenCalledTimes(2);
  });
});

describe("Cuisine page", () => {
  it("loads the cuisine and its recipes through the server function", async () => {
    cuisineData.mockResolvedValue({ cuisine, recipes: [recipeCard] } as never);

    await renderRoute("/cuisine/c1");

    expect(await screen.findByRole("heading", { name: "Soul Food" })).toBeInTheDocument();
    expect(screen.getByText("Collard Greens")).toBeInTheDocument();
    expect(cuisineData).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    cuisineData.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/cuisine/c1");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load this page");

    cuisineData.mockResolvedValue({ cuisine, recipes: [recipeCard] } as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "Soul Food" })).toBeInTheDocument();
    expect(cuisineData).toHaveBeenCalledTimes(2);
  });
});

describe("Recipe detail page", () => {
  it("loads the recipe and ingredients through the server function", async () => {
    recipeData.mockResolvedValue({ recipe: recipeFull, ingredients: [ingredient] } as never);

    await renderRoute("/recipe/r1");

    expect(await screen.findByRole("heading", { name: "Collard Greens" })).toBeInTheDocument();
    expect(screen.getByText(/collard greens/)).toBeInTheDocument();
    expect(recipeData).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    recipeData.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/recipe/r1");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load this page");

    recipeData.mockResolvedValue({ recipe: recipeFull, ingredients: [ingredient] } as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "Collard Greens" })).toBeInTheDocument();
    expect(recipeData).toHaveBeenCalledTimes(2);
  });
});

describe("Shopping list page", () => {
  it("loads list ingredients through the server function", async () => {
    localStorage.setItem("lets-eat-list", JSON.stringify(["r1"]));
    listIngredients.mockResolvedValue([ingredient] as never);

    await renderRoute("/shopping-list");

    expect(await screen.findByText(/collard greens/)).toBeInTheDocument();
    expect(listIngredients).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    localStorage.setItem("lets-eat-list", JSON.stringify(["r1"]));
    listIngredients.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/shopping-list");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load your list right now.");

    listIngredients.mockResolvedValue([ingredient] as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText(/collard greens/)).toBeInTheDocument();
    expect(listIngredients).toHaveBeenCalledTimes(2);
  });

  it("adds a custom item and stores it on the device", async () => {
    await renderRoute("/shopping-list");

    fireEvent.change(await screen.findByLabelText("Add item"), { target: { value: "Vegetable oil" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Vegetable oil")).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("lets-eat-custom-items") || "[]");
    expect(stored[0].name).toBe("Vegetable oil");
  });

  it("shows previously added custom items on load", async () => {
    localStorage.setItem("lets-eat-custom-items", JSON.stringify([{ id: "c1", name: "Salt" }]));
    await renderRoute("/shopping-list");

    expect(await screen.findByText("Salt")).toBeInTheDocument();
  });
});

describe("Nearby page", () => {
  it("loads places through the server function", async () => {
    sourcesData.mockResolvedValue([source] as never);

    await renderRoute("/nearby");

    expect(await screen.findByText("Eastern Market")).toBeInTheDocument();
    expect(sourcesData).toHaveBeenCalledTimes(1);
  });

  it("shows an error with retry, and recovers when the retry succeeds", async () => {
    sourcesData.mockRejectedValueOnce(new Error("down"));
    await renderRoute("/nearby");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load places right now.");

    sourcesData.mockResolvedValue([source] as never);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Eastern Market")).toBeInTheDocument();
    expect(sourcesData).toHaveBeenCalledTimes(2);
  });
});
