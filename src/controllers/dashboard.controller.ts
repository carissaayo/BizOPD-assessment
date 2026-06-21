import { Controller } from "../core/handlers/controller";
import { getDashboard } from "../services/dashboard/dashboard.service";

export const getDashboardHandler = Controller(async () => {
  return getDashboard();
});
