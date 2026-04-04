export class MockStorage {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  get length(): number {
    return this.store.size;
  }
}

export function setupTests() {
  if (typeof global.window === "undefined") {
    // @ts-expect-error Types may be incomplete or global variables need mocking
    global.window = {};
  }

  if (typeof global.localStorage === "undefined") {
    // @ts-expect-error Types may be incomplete or global variables need mocking
    global.localStorage = new MockStorage();
  }
}

export function resetStorage() {
  if (global.localStorage) {
    global.localStorage.clear();
  }
}
