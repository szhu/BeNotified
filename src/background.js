import {
  ClosedMomentId,
  LastCheckError,
  LastCheckedAt,
  LastMomentId,
  SettingApiKey,
  SettingPower,
} from "./lib.js";

const AlarmId = "main";
const NotificationId = "main";

async function reregisterAlarms() {
  chrome.notifications.clear(NotificationId);
  await chrome.alarms.clearAll();

  if (await SettingPower.get()) {
    await chrome.alarms.create(AlarmId, {
      periodInMinutes: 5 / 60,
    });
    checkBereal();
  }
}

/**
 * @returns {Promise<CheckBerealResponse>}
 */
async function checkBerealApi() {
  const apiKeySetting = await SettingApiKey.get();

  // Hidden setting for power users: If the API key is a valid URL, just use it
  // as the entire API URL. This can be useful if you have a mirror of the
  // BeReal API you want to use.
  let apiKeyAsUrl;
  try {
    apiKeyAsUrl = apiKeySetting ? new URL(apiKeySetting) : undefined;
  } catch {}
  const url = apiKeyAsUrl
    ? apiKeySetting
    : `https://bereal.devin.rest/v1/moments/latest?api_key=${apiKeySetting}`;

  if (!url) throw new Error("No API key set");

  const response = await fetch(url);
  if (!response.ok) {
    await LastCheckError.set(await response.text());
    throw new Error("Failed to check BeReal: " + LastCheckError.lastValue);
  }

  const json = await response.json();
  if (json.error) {
    await LastCheckError.set(json.error.reason);
    throw new Error("Failed to check BeReal: " + LastCheckError.lastValue);
  }

  await LastCheckError.set(undefined);
  return json;
}

async function sendNotification() {
  chrome.notifications.create(NotificationId, {
    type: "basic",
    isClickable: false,
    requireInteraction: true,
    iconUrl: "icon.png",
    title: "Time to BeReal",
    message:
      "2 min left to capture a BeReal and see what your friends are up to!",
    priority: 2,
  });
}

async function checkBereal() {
  LastCheckedAt.set(new Date().toISOString());
  await LastCheckError.set(undefined);
  const checkResponse = await checkBerealApi();
  await LastMomentId.set(checkResponse.regions["us-central"].id);

  // If we have already shown this moment, don't show it again.
  if (LastMomentId.lastValue === (await ClosedMomentId.get())) return;

  // If the notification is already showing, don't show it again.
  const existingNotification = await new Promise((resolve) =>
    chrome.notifications.getAll(resolve),
  );
  if (existingNotification[NotificationId]) return;

  await sendNotification();
}

async function register() {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === AlarmId) {
      checkBereal();
    }
  });
  chrome.notifications.onClicked.addListener(async (id) => {
    if (id === NotificationId) {
    }
  });
  chrome.notifications.onClosed.addListener(async (id) => {
    if (id === NotificationId) {
      const lastMomentId = LastMomentId.lastValue;
      await ClosedMomentId.set(lastMomentId);
    }
  });
  chrome.runtime.onMessage.addListener(async (message) => {
    if (typeof message === "object" && message && "type" in message) {
      switch (message.type) {
        case "refresh":
          await reregisterAlarms();
          break;
        case "check":
          await checkBereal();
          break;
        case "send-notification":
          await sendNotification();
          break;
      }
    }
  });
  reregisterAlarms();
}

register();
