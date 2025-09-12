import pool from "../database/database.js";

async function studentsupdate(req, res) {
  try {
    const {
      id,
      name,
      father_guardian_name,
      dob,
      blood_group,
      student_contact_number,
      parent_guardian_contact_number,
      address,
      department,
      academic_year,
      registration_number,
      roll_number,
      room_number,
      profile_photo
    } = req.body;

    const query = `
      UPDATE students
      SET 
        name = $1,
        father_guardian_name = $2,
        dob = $3,
        blood_group = $4,
        student_contact_number = $5,
        parent_guardian_contact_number = $6,
        address = $7,
        department = $8,
        academic_year = $9,
        registration_number = $10,
        roll_number = $11,
        room_number = $12,
        profile_photo = $13
      WHERE id = $14
      RETURNING *;
    `;

    const values = [
      name,
      father_guardian_name,
      dob,
      blood_group,
      student_contact_number,
      parent_guardian_contact_number,
      address,
      department,
      academic_year,
      registration_number,
      roll_number,
      room_number,
      profile_photo,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
}

export default studentsupdate;
