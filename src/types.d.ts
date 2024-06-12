declare const React: typeof import("react");

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const ReactDOM: typeof import("react-dom/client");

type BerealRegionId = "us-central" | "europe-west" | "asia-west" | "asia-east";

interface CheckBerealResponse {
  regions: Record<BerealRegionId, CheckBerealRegion>;
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
