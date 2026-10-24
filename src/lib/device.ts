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
