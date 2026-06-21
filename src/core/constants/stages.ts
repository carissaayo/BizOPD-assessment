import { HttpError } from "../errors/custom-error-handler";

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

export function validateStageTransition(
  currentStage: Stage,
  newStage: Stage,
): void {
  if (currentStage === "Delivered") {
    throw HttpError.badRequest("Delivered orders cannot be changed");
  }

  const currentIndex = STAGES.indexOf(currentStage);
  const newIndex = STAGES.indexOf(newStage);

  if (newIndex <= currentIndex) {
    throw HttpError.badRequest("Orders cannot move backwards");
  }

  if (newIndex !== currentIndex + 1) {
    throw HttpError.badRequest("Orders cannot skip stages");
  }
}
