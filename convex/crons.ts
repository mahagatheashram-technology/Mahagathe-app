import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "Refresh daily content and entitlement subscriptions",
  { minutes: 1 },
  internal.clock.tick,
  {},
);
export default crons;
