const { Finance } = require("../../schemas/finance");
const { Types } = require("mongoose");

async function getSummary(req, res) {
  const owner = req.user.id;
  const { type = "expenses", month = 0, year = 0 } = req.query;
  const searchParam = {
    owner: Types.ObjectId(owner),
    type,
    month: parseInt(month),
    year: parseInt(year),
  };
  try {
    // console.log("getSummary searchParam", searchParam);
    const result = await Finance.aggregate([
      { $match: searchParam },
      { $project: { amount: 1, owner: 1 } },
      { $group: { _id: "amount", amount: { $sum: "$amount" } } },
    ]);
    // console.log("getSummary result", result.length, result);

    if (result.length === 1) {
      const { amount } = result[0];
      return res.status(200).json({ ...searchParam, amount });
    }

    return res.status(200).json({ amount: 0, message: "no result" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = getSummary;
