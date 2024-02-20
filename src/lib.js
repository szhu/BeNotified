/**
 * @param {string} key
 * @template T
 * @param {T} defaultValue
 */
function makeSyncedItem(key, defaultValue) {
  const self = {
    key,
    lastValue: defaultValue,

    /**
     * @returns {Promise<T>}
     */
    async get() {
      const valueFromStorage = (await chrome.storage.sync.get(key))[key];
      const value = valueFromStorage ?? defaultValue;
      self.lastValue = value;
      return value;
    },

    /**
     * @param {T} value
     */
    async set(value) {
      self.lastValue = value;
      // console.log("chrome.storage.sync.set", { [key]: value });
      (await value)
        ? chrome.storage.sync.set({ [key]: value })
        : chrome.storage.sync.remove(key);
      chrome.runtime.sendMessage({ type: "storage-change", key, value });
    },
  };

  return self;
}

/**
 * @template T
 * @param {ReturnType<typeof makeSyncedItem<T>>} item
 * @returns {[T, (value: T) => Promise<void>]}
 */
export function useSyncedState(item) {
  const [value, setDisplayedValue] = React.useState(item.lastValue);

  React.useEffect(() => {
    async function effect() {
      const value = await item.get();
      setDisplayedValue(value);
    }
    effect();
  }, [item]);

  React.useEffect(() => {
    /**
     * @param {any} message
     */
    function handler(message) {
      if (typeof message === "object" && message && "type" in message) {
        if (message.type === "storage-change" && message.key === item.key) {
          setDisplayedValue(message.value);
        }
      }
    }

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, []);

  /**
   * @param {T} value
   */
  async function setValue(value) {
    setDisplayedValue(value);
    await item.set(value);
  }

  return [value, setValue];
}

export const SettingPower = makeSyncedItem(
  "setting-power",
  /** @type {boolean | undefined} */ (undefined),
);
export const SettingApiKey = makeSyncedItem(
  "setting-api-key",
  /** @type {string | undefined} */ (undefined),
);

export const LastCheckedAt = makeSyncedItem(
  "last-checked-at",
  /** @type {string | undefined} */ (undefined),
);
export const LastMomentId = makeSyncedItem(
  "last-moment-id",
  /** @type {string | undefined} */ (undefined),
);
export const LastCheckError = makeSyncedItem(
  "last-check-error",
  /** @type {unknown | undefined} */ (undefined),
);

export const ClosedMomentId = makeSyncedItem(
  "closed-moment-id",
  /** @type {string | undefined} */ (undefined),
);
