import { isValidJsonString } from "./utils";

class LocalStore {
  getItem(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue; // SSR safe
    const value = window.localStorage.getItem(key);
    return isValidJsonString(value) ? JSON.parse(value) : defaultValue;
  }

  setItem(key, value) {
    if (typeof window === "undefined") return; // SSR safe
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key) {
    if (typeof window === "undefined") return; // SSR safe
    window.localStorage.removeItem(key);
  }
}

const localStore = Object.freeze(new LocalStore());
export default localStore;
