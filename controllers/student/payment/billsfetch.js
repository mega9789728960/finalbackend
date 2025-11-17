import pool from '../../../database/database.js';

const showPaidMessBillsByStudentId = async (req, res) => {
  const client = await pool.connect();

  try {
    const { student_id } = req.body; // or req.query for GET requests

    if (!student_id) {
      return res.status(400).json({ error: "student_id is required" });
    }

    const query = `
      SELECT 
        mb.id AS mess_bill_id,
        mb.student_id,
        mb.monthly_base_cost_id AS base_id,
        mb.monthly_year_data_id AS year_data_id,
        mb.number_of_days,
        mb.status,
        mb.latest_order_id,
        mb.paid_date,        -- Added paid_date
        mb.created_at,
        mb.updated_at,
        mb.show,
        mb.verified,
        mb.isveg,
        mb.veg_days,
        mb.non_veg_days,
        mbc.month_year,
        mbc.grocery_cost,
        mbc.vegetable_cost,
        mbc.gas_charges,
        mbc.total_milk_litres,
        mbc.milk_cost_per_litre,
        mbc.milk_charges_computed,
        mbc.deductions_income,
        mbc.veg_extra_per_day,
        mbc.nonveg_extra_per_day,
        mbc.total_expenditure,
        mbc.expenditure_after_income,
        mbc.mess_fee_per_day,
       
        mbc.veg_served_days,
        mbc.nonveg_served_days,
        mbc.reduction_applicable_days
      FROM mess_bill_for_students mb
      LEFT JOIN monthly_base_costs mbc
        ON mb.monthly_base_cost_id = mbc.id
      WHERE mb.student_id = $1 
      ORDER BY mbc.month_year DESC NULLS LAST;
    `;

    const result = await client.query(query, [student_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No paid mess bills found for this student." });
    }

    res.json({
      success: true,
      message: "Paid mess bills fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching mess bills:", error);
    res.status(500).json({ error: "Failed to fetch paid mess bills" });
  } finally {
    client.release();
  }
};

export default showPaidMessBillsByStudentId;
