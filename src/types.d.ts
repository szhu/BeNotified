declare var React: typeof import("react");
declare var ReactDOM: typeof import("react-dom/client");

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
