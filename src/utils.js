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
      const result = await chrome.storage.sync.get(key);
      const valueFromStorage = result[key];
      const value = valueFromStorage ?? defaultValue;
      self.lastValue = value;
      return value;
    },

    /**
     * @param {T} value
     */
    async set(value) {
      self.lastValue = value;
      value
        ? await chrome.storage.sync.set({ [key]: value })
        : await chrome.storage.sync.remove(key);
      await chrome.runtime
        .sendMessage({ type: "storage-change", key, value })
        .catch(() => {
          // This is expected if there is only one frame in the extension;
          // i.e. if the popup is closed.
        });
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
    void effect();
  }, [item]);

  React.useEffect(() => {
    /**
     * @param {any} message
     */
    function handler(message) {
      if (
        typeof message === "object" &&
        message &&
        "type" in message &&
        message.type === "storage-change" &&
        message.key === item.key
      ) {
        setDisplayedValue(message.value);
      }
    }

    chrome.runtime.onMessage.addListener(handler);

    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }, [item.key]);

  /**
   * @param {T} value
   */
  async function setValue(value) {
    setDisplayedValue(value);
    await item.set(value);
  }

  return [value, setValue];
}

export const SettingIsOn = makeSyncedItem(
  "setting-is-on",
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
export const ClosedMomentAt = makeSyncedItem(
  "closed-moment-at",
  /** @type {string | undefined} */ (undefined),
);
