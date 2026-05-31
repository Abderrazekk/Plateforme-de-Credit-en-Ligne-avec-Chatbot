import Loan from '../models/Loan.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get admin summary stats for reports
// @route   GET /api/reports/summary
// @access  Admin
export const getReportSummary = async (req, res, next) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    const closedLoans = await Loan.countDocuments({ status: 'closed' });
    const totalAmountDisbursed = await Loan.aggregate([
      { $match: { status: { $in: ['active', 'closed'] } } },
      { $group: { _id: null, total: { $sum: '$montant' } } }
    ]);

    // Repayment rate (paid / total installments)
    const repaymentPipeline = [
      { $unwind: '$remboursements' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ['$remboursements.status', 'paid'] }, 1, 0] } }
        }
      }
    ];
    const repaymentStats = await Loan.aggregate(repaymentPipeline);
    const repaymentRate = repaymentStats.length > 0
      ? Math.round((repaymentStats[0].paid / repaymentStats[0].total) * 100)
      : 0;

    res.json({
      totalLoans,
      totalClients,
      activeLoans,
      closedLoans,
      totalAmountDisbursed: totalAmountDisbursed[0]?.total || 0,
      repaymentRate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly loan applications for charts
// @route   GET /api/reports/monthly
// @access  Admin
export const getMonthlyLoans = async (req, res, next) => {
  try {
    const monthlyData = await Loan.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$montant' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    res.json(monthlyData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get loan status distribution
// @route   GET /api/reports/status
// @access  Admin
export const getStatusDistribution = async (req, res, next) => {
  try {
    const statusData = await Loan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(statusData);
  } catch (error) {
    next(error);
  }
};