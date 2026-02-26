// Mock localStorage and window
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  };
})();

(global as any).localStorage = localStorageMock;

const listeners: Record<string, any[]> = {};
(global as any).window = {
  addEventListener: (type: string, listener: any) => {
    listeners[type] = listeners[type] || [];
    listeners[type].push(listener);
  },
  removeEventListener: (type: string, listener: any) => {
    if (listeners[type]) {
      listeners[type] = listeners[type].filter(l => l !== listener);
    }
  },
  dispatchEvent: (event: any) => {
    const type = event.type;
    if (listeners[type]) {
      listeners[type].forEach((l: any) => l(event));
    }
    return true;
  },
};

export { localStorageMock };
