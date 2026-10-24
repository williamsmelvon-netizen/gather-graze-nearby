const KEY = "lets-eat-device-id";
const LIST = "lets-eat-list";

export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getLocalList(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIST) || "[]");
  } catch {
    return [];
  }
}

export function setLocalList(ids: string[]) {
  localStorage.setItem(LIST, JSON.stringify(ids));
}

// Custom items typed by hand on the shopping list screen.
const CUSTOM = "lets-eat-custom-items";

export type CustomItem = { id: string; name: string };

export function getCustomItems(): CustomItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM) || "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.name === "string") : [];
  } catch {
    return [];
  }
}

export function addCustomItem(name: string): CustomItem[] {
  const clean = name.trim().slice(0, 100);
  if (!clean) return getCustomItems();
  const items = getCustomItems();
  if (items.some((i) => i.name.toLowerCase() === clean.toLowerCase())) return items;
  const next = [...items, { id: crypto.randomUUID(), name: clean }];
  localStorage.setItem(CUSTOM, JSON.stringify(next));
  return next;
}

export function removeCustomItem(id: string): CustomItem[] {
  const next = getCustomItems().filter((i) => i.id !== id);
  localStorage.setItem(CUSTOM, JSON.stringify(next));
  return next;
}
