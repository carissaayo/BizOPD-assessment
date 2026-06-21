export const STAGES = [
  "Pending Design",
  "Awaiting Approval",
  "Printing",
  "Framing",
  "Packaging",
  "Ready for Pickup",
  "Delivered",
] as const;

export type Stage = (typeof STAGES)[number];

export const INITIAL_STAGE: Stage = STAGES[0];
