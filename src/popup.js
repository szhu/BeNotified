import {
  ClosedMomentAt,
  ClosedMomentId,
  LastCheckError,
  LastCheckedAt,
  LastMomentId,
  SettingApiKey,
  SettingIsOn,
  useSyncedState,
} from "./utils.js";

// eslint-disable-next-line unicorn/prevent-abbreviations
const El = React.createElement;

const container = document.createElement("div");
document.body.append(container);
ReactDOM.createRoot(container).render(El(PopupUi));

const Fieldset = /** @type {const} */ ([
  "fieldset",
  {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "0.6em",
      border: "1px solid #ccc",
      borderRadius: "1px",
      padding: "0.8em 0.8em",
    },
  },
]);

const InputStyle = /** @type {import("react").CSSProperties} */ ({
  font: "unset",
  border: "1px solid #999",
  padding: "0.4em 0.3em",
  borderRadius: "2px",
  cursor: "pointer",
});

function PopupUi() {
  const [isOn, setIsOn] = useSyncedState(SettingIsOn);
  const [apiKey, setApiKey] = useSyncedState(SettingApiKey);
  const [lastCheckedAt, setLastCheckedAt] = useSyncedState(LastCheckedAt);
  const [lastCheckError, setLastCheckError] = useSyncedState(LastCheckError);
  const [lastMomentId, setLastMomentId] = useSyncedState(LastMomentId);
  const [closedMomentId, setClosedMomentId] = useSyncedState(ClosedMomentId);
  const [closedMomentAt, setClosedMomentAt] = useSyncedState(ClosedMomentAt);

  const [isDebugUiVisible, setIsShowDebugUiVisible] = React.useState(false);

  return El(
    "div",
    {
      style: {
        width: "340px",
        font: "14px system-ui, sans-serif",
        userSelect: "none",
      },
    },
    [
      El(
        "h1",
        {
          style: {
            color: "white",
            background: "black",
            fontSize: "1.5em",
            margin: "unset",
            padding: "0.5em 1em",
            textAlign: "center",
          },
        },
        [
          El("span", { style: { fontFamily: "initial" } }, "⚠️️️"),
          " Time to BeReal ",
          El("span", { style: { fontFamily: "initial" } }, "⚠️️️"),
        ],
      ),

      El(
        "section",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            padding: "1em 0.6em",
          },
        },

        El(...Fieldset, [
          El(
            "label",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "0.2em",
                cursor: "pointer",
              },
            },
            [
              El("input", {
                type: "checkbox",
                style: InputStyle,
                checked: Boolean(isOn),
                disabled: !apiKey,
                async onChange(event) {
                  await setIsOn(event.currentTarget.checked);
                  await chrome.runtime.sendMessage({ type: "refresh" });
                },
              }),
              El("b", {}, ["Enable Time to BeReal Notifications"]),
            ],
          ),
        ]),

        El(...Fieldset, [
          El("div", {}, [
            "To use this extension, you’ll need a key from bereal.devin.fun, an unofficial BeReal API. ",
            El(
              "u",
              {
                style: {
                  cursor: "pointer",
                  display: "inline-block",
                },
                async onClick() {
                  globalThis.alert(
                    "On the next page, click the API tab to request an API key.",
                  );
                  await chrome.tabs.create({
                    url: "https://bereal.devin.fun/",
                  });
                },
              },
              ["Get API Key"],
            ),
          ]),

          El("input", {
            style: InputStyle,
            type: "text",
            placeholder: "Paste API key here",
            value: apiKey,
            async onChange(event) {
              const apiKey = event.currentTarget.value;
              if (!apiKey) {
                await setIsOn(false);
                await chrome.runtime.sendMessage({ type: "refresh" });
              }
              await setApiKey(apiKey);
            },
            async onKeyPress(event) {
              if (event.key === "Enter") {
                event.currentTarget.select();
                if (apiKey && !isOn) {
                  await setIsOn(true);
                  await chrome.runtime.sendMessage({ type: "refresh" });
                }
              }
            },
            async onClick(event) {
              const input = event.currentTarget;
              await new Promise((resolve) => globalThis.setTimeout(resolve));
              input.select();
            },
          }),
        ]),

        El(...Fieldset, [
          El("div", {}, [
            El("b", {}, ["BeNotified for Chrome"]),
            [" by Sean Zhu"],
            El("br"),
            El("span", { style: { color: "#999" } }, [
              "Not affiliated with BeReal or devin.fun.",
            ]),
          ]),

          El(
            "button",
            {
              style: InputStyle,
              async onClick() {
                await chrome.tabs.create({
                  url: "https://github.com/szhu/BeNotified",
                });
              },
            },
            ["Extension Website"],
          ),

          El(
            "button",
            {
              style: InputStyle,
              async onClick() {
                await chrome.tabs.create({
                  url: "https://github.com/szhu/BeNotified/issues",
                });
              },
            },
            ["Report Issue"],
          ),

          !isDebugUiVisible &&
            El(
              "button",
              {
                style: InputStyle,
                onClick() {
                  setIsShowDebugUiVisible(true);
                },
              },
              ["Show Debug Info"],
            ),
        ]),

        isDebugUiVisible &&
          El(...Fieldset, [
            El("legend", {}, ["Debug Info"]),
            El(
              "pre",
              {
                style: {
                  margin: "unset",
                  fontSize: "0.9em",
                  whiteSpace: "pre-wrap",
                  userSelect: "text",
                },
              },
              [
                //
                "Last checked at:",
                lastCheckedAt ?? "Never",
                "",
                "Last check status:",
                lastCheckError ?? "OK",
                "",
                "Last moment ID:",
                lastMomentId ?? "None",
                "",
                "Closed moment ID:",
                closedMomentId ?? "None",
                "",
                "Closed moment at:",
                closedMomentAt ?? "Never",
                "",
              ].join("\n"),
            ),
            El(
              "button",
              {
                style: InputStyle,
                async onClick() {
                  await chrome.runtime.sendMessage({ type: "check" });
                },
              },
              ["Check API Now"],
            ),
            El(
              "button",
              {
                style: InputStyle,
                async onClick() {
                  await chrome.runtime.sendMessage({
                    type: "send-notification",
                  });
                },
              },
              ["Send Test Notification Now"],
            ),
            El(
              "button",
              {
                style: InputStyle,
                async onClick() {
                  await setLastCheckedAt(undefined);
                  await setLastCheckError(undefined);
                  await setLastMomentId(undefined);
                  await setClosedMomentId(undefined);
                  await setClosedMomentAt(undefined);
                },
              },
              ["Reset"],
            ),
          ]),
      ),
    ],
  );
}
