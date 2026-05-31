import {
  getAdminStatsData,
  getMonthlyRevenueData,
} from "../services/dashboardService.js";

export const getAdminStats = async (req, res, next) => {
  try {
    const data = await getAdminStatsData();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenue = async (req, res, next) => {
  try {
    const data = await getMonthlyRevenueData();
    res.json(data);
  } catch (error) {
    next(error);
  }
};
