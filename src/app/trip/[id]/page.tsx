import { TripShell } from "./trip-view";

// Fully static shell — all data loads client-side so edge CDN serves
// this instantly with zero function boot.
export default function TripPage() {
  return <TripShell />;
}
