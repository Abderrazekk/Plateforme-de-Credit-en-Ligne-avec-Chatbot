import Loan from "../models/Loan.js";
import User from "../models/User.js";

export const getAdminStatsData = async () => {
  const totalApproved = await Loan.countDocuments({
    status: { $in: ["approved", "active", "closed"] },
  });
  const totalRejected = await Loan.countDocuments({ status: "rejected" });
  const totalLoans = await Loan.countDocuments();
  const totalClients = await User.countDocuments({ role: "client" });
  const acceptanceRate =
    totalApproved + totalRejected > 0
      ? Math.round((totalApproved / (totalApproved + totalRejected)) * 100)
      : 0;

  const totalAmount = await Loan.aggregate([
    { $match: { status: { $in: ["approved", "active", "closed"] } } },
    { $group: { _id: null, total: { $sum: "$montant" } } },
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const [revenusMensuels, revenusAnnuels] = await Promise.all([
    Loan.aggregate([
      { $unwind: "$remboursements" },
      {
        $match: {
          "remboursements.status": "paid",
          "remboursements.payeLe": { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$remboursements.montant" } } },
    ]),
    Loan.aggregate([
      { $unwind: "$remboursements" },
      {
        $match: {
          "remboursements.status": "paid",
          "remboursements.payeLe": { $gte: startOfYear },
        },
      },
      { $group: { _id: null, total: { $sum: "$remboursements.montant" } } },
    ]),
  ]);

  const interestData = await Loan.aggregate([
    { $match: { status: { $in: ["active", "closed"] } } },
    { $unwind: "$remboursements" },
    { $match: { "remboursements.status": "paid" } },
    { $group: { _id: null, totalPaid: { $sum: "$remboursements.montant" } } },
  ]);
  const totalPrincipal = await Loan.aggregate([
    { $match: { status: { $in: ["active", "closed"] } } },
    { $group: { _id: null, total: { $sum: "$montant" } } },
  ]);
  const interetsGeneres =
    interestData.length > 0 && totalPrincipal.length > 0
      ? interestData[0].totalPaid - totalPrincipal[0].total
      : 0;

  const lateInstallments = await Loan.aggregate([
    { $unwind: "$remboursements" },
    {
      $match: {
        "remboursements.status": "unpaid",
        "remboursements.dateEcheance": { $lt: now },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: "$remboursements.montant" },
        clients: { $addToSet: "$client" },
      },
    },
  ]);
  const retardsCount = lateInstallments[0]?.count || 0;
  const retardsAmount = lateInstallments[0]?.totalAmount || 0;
  const clientsEnRetard = lateInstallments[0]?.clients?.length || 0;

  const newClientsThisMonth = await User.countDocuments({
    role: "client",
    createdAt: { $gte: startOfMonth },
  });
  const activeClients = await Loan.distinct("client", { status: "active" });

  return {
    totalApproved,
    totalRejected,
    totalLoans,
    totalClients,
    acceptanceRate,
    totalAmount: totalAmount[0]?.total || 0,
    revenusMensuels: revenusMensuels[0]?.total || 0,
    revenusAnnuels: revenusAnnuels[0]?.total || 0,
    interetsGeneres,
    retardsCount,
    retardsAmount,
    clientsEnRetard,
    newClientsThisMonth,
    activeClients: activeClients.length,
  };
};

export const getMonthlyRevenueData = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyData = await Loan.aggregate([
    { $unwind: "$remboursements" },
    {
      $match: {
        "remboursements.status": "paid",
        "remboursements.payeLe": { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$remboursements.payeLe" },
          month: { $month: "$remboursements.payeLe" },
        },
        revenu: { $sum: "$remboursements.montant" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const result = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = monthlyData.find(
      (m) => m._id.year === year && m._id.month === month,
    );
    result.push({
      mois: `${month.toString().padStart(2, "0")}/${year}`,
      revenu: found ? found.revenu : 0,
    });
  }
  return result;
};
