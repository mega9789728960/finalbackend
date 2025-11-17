import pool from '../../../database/database.js';

export const fetchMonthlyCalculations = async (req, res) => {
  const client = await pool.connect();

  try {
    
    const { year } = req.body;

    // Build base query dynamically
    let query = `
      SELECT 
        b.id AS monthly_base_costs_id,
        b.month_year,
        b.grocery_cost,
        b.vegetable_cost,
        b.gas_charges,
        b.total_milk_litres,
        b.milk_cost_per_litre,
        b.milk_charges_computed,
        b.other_costs,
        b.deductions_income,
        b.veg_extra_per_day,
        b.nonveg_extra_per_day,
        b.total_expenditure,
        b.expenditure_after_income,
        b.mess_fee_per_day,
        b.created_at,
       
        b.veg_served_days,
        b.nonveg_served_days,
        b.reduction_applicable_days,
        y.id AS monthly_year_data_id,
        y.year,
        y.total_students,
        y.total_days,
        y.created_at AS year_data_created_at
      FROM public.monthly_base_costs b
      LEFT JOIN public.monthly_year_data y
        ON y.monthly_base_id = b.id
    `;

    const values = [];

    // ✅ Apply year filter if provided
    if (year) {
      query += ` WHERE b.month_year LIKE $1 `;
      values.push(`%${year}`);
    }

    query += ` ORDER BY b.created_at DESC, y.year ASC;`;

    const result = await client.query(query, values);

    // ✅ Group results by each base month
    const grouped = {};
    result.rows.forEach(row => {
      const id = row.monthly_base_costs_id;

      if (!grouped[id]) {
        grouped[id] = {
          monthly_base_costs_id: row.monthly_base_costs_id,
          month_year: row.month_year,
          grocery_cost: row.grocery_cost,
          vegetable_cost: row.vegetable_cost,
          gas_charges: row.gas_charges,
          total_milk_litres: row.total_milk_litres,
          milk_cost_per_litre: row.milk_cost_per_litre,
          milk_charges_computed: row.milk_charges_computed,
          other_costs: row.other_costs,
          deductions_income: row.deductions_income,
          veg_extra_per_day: row.veg_extra_per_day,
          nonveg_extra_per_day: row.nonveg_extra_per_day,
          total_expenditure: row.total_expenditure,
          expenditure_after_income: row.expenditure_after_income,
          mess_fee_per_day: row.mess_fee_per_day,
          progress_stage: row.progress_stage,
          veg_served_days: row.veg_served_days,
          nonveg_served_days: row.nonveg_served_days,
          reduction_applicable_days: row.reduction_applicable_days,
          created_at: row.created_at,
          years_data: []
        };
      }

      if (row.year !== null) {
        grouped[id].years_data.push({
          monthly_year_data_id: row.monthly_year_data_id,
          year: row.year,
          total_students: row.total_students,
          total_days: row.total_days,
          created_at: row.year_data_created_at
        });
      }
    });

    const finalResult = Object.values(grouped);

    res.status(200).json({
      message: `✅ Monthly calculations fetched successfully${year ? ` for year ${year}` : ''}`,
      count: finalResult.length,
      data: finalResult
    });

  } catch (error) {
    console.error('❌ Error fetching monthly calculations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
};
