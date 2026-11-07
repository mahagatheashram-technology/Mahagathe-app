import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.daily(
  "Refresh daily content and entitlement subscriptions",
  { hourUTC: 18, minuteUTC: 30 },
  internal.clock.tick,
  {},
);
export default crons;
