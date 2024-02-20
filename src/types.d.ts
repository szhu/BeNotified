declare const React: typeof import("react");

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const ReactDOM: typeof import("react-dom/client");

interface CheckBerealResponse {
  regions: {
    "us-central": CheckBerealRegion;
    "europe-west": CheckBerealRegion;
    "asia-west": CheckBerealRegion;
    "asia-east": CheckBerealRegion;
  };
  now: {
    ts: number;
    utc: string;
  };
}

interface CheckBerealRegion {
  id: string;
  ts: string;
  utc: string;
}
