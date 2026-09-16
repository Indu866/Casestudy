const express = require("express");
const pool = require("./db");
require("dotenv").config();
const bcrypt = require("bcrypt");
const authenticateToken = require("./middleware/auth");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authorizeRoles = require("./middleware/authorize");
const sendOtpEmail = require("./utils/sendEmail")
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


app.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "No account found with this email." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire any previous unused OTPs for this email
    await pool.query(
      "UPDATE password_reset_otps SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email]
    );

    // Save new OTP with 10 min expiry
    await pool.query(
      `INSERT INTO password_reset_otps (email, otp, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [email, otp]
    );

    // Send OTP via Gmail
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email." });

  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP. Try again." });
  }
});


// STEP 2 — Verify OTP and reset password
app.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find valid OTP
    const result = await pool.query(
      `SELECT * FROM password_reset_otps
       WHERE email = $1
         AND otp = $2
         AND used = FALSE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    // Mark OTP as used
    await pool.query(
      "UPDATE password_reset_otps SET used = TRUE WHERE id = $1",
      [result.rows[0].id]
    );

    res.json({ message: "Password reset successfully." });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Server error. Try again." });
  }
});


// Login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {                        // ← add this
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        department_id: user.department_id
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
});



  app.get("/categories", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, name FROM complaint_categories ORDER BY name ASC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Fetch Categories Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });


app.post(
  "/complaints",
  authenticateToken,
  authorizeRoles(1), // Role 1 = Student
  async (req, res) => {
    try {
      const { title, description, category_id } = req.body;
      const student_id = req.user.id;

      if (!title || !description || !category_id) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      // Get category info to determine complaint scope
      const categoryResult = await pool.query(
        "SELECT routing_type FROM complaint_categories WHERE id = $1",
        [category_id]
      );

      if (categoryResult.rows.length === 0) {
        return res.status(400).json({ error: "Invalid category" });
      }

      // Determine complaint_scope based on routing_type
      let complaint_scope = "COLLEGE"; // Default scope
      let hostel_id = null;

      if (categoryResult.rows[0].routing_type === "HOSTEL") {
        complaint_scope = "HOSTEL";

        // Get the student's hostel_id
        const userResult = await pool.query(
          "SELECT hostel_id FROM users WHERE id = $1",
          [student_id]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].hostel_id) {
          return res.status(400).json({ error: "Hostel ID not found for the student" });
        }

        hostel_id = userResult.rows[0].hostel_id;
      }

      // Check for similar complaints
      const similarComplaints = await pool.query(
        `SELECT c.id, c.title, c.description, c.status, c.created_at,
                SIMILARITY(c.title, $1) AS title_similarity,
                SIMILARITY(c.description, $2) AS description_similarity
         FROM complaints c
         WHERE c.category_id = $3
           AND c.status != 'RESOLVED'
           AND (SIMILARITY(c.title, $1) > 0.4 OR SIMILARITY(c.description, $2) > 0.4)
         ORDER BY title_similarity DESC, description_similarity DESC
         LIMIT 1`,
        [title, description, category_id]
      );
      console.log("Similar Complaints:", similarComplaints.rows);
      if (similarComplaints.rows.length > 0) {
        return res.status(409).json({
          error: "Duplicate complaint detected",
          existingComplaint: similarComplaints.rows[0],
        });
      }

      // Insert the new complaint
      const result = await pool.query(
        `INSERT INTO complaints
        (title, description, student_id, category_id, complaint_scope, hostel_id, status, severity)
        VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', 'MEDIUM')
        RETURNING *`,
        [title, description, student_id, category_id, complaint_scope, hostel_id]
      );

      res.status(201).json({
        message: "Complaint submitted successfully",
        complaint: result.rows[0],
      });
    } catch (err) {
      console.error("Complaint Creation Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);




//get all complaints
  app.get("/complaints", authenticateToken, async (req, res) => {
    try {
      const complaints = await pool.query(`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.status,
          c.severity,
          c.upvote_count,
          c.created_at,
          cc.name as category
        FROM complaints c
        JOIN complaint_categories cc 
        ON c.category_id = cc.id
        ORDER BY c.created_at DESC
      `);
  
      res.json(complaints.rows);
  
    } catch (err) {
      console.error("Fetch Complaints Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  
  //get my complaints

  app.get(
    "/api/my-complaints",
    authenticateToken,
    authorizeRoles(1),
    async (req, res) => {
      try {
        const student_id = req.user.id;
  
        const complaints = await pool.query(
          `SELECT c.*, cc.name AS category
           FROM complaints c
           JOIN complaint_categories cc ON c.category_id = cc.id
           WHERE c.student_id = $1
           ORDER BY c.created_at DESC`,
          [student_id]
        );
  
        res.json({ complaints: complaints.rows });
  
      } catch (err) {
        console.error("My Complaints Error:", err);
        res.status(500).json({ error: err.message });
      }
    }
  );

//accept complaints
app.put(
  "/complaints/:id/accept",
  authenticateToken,
  authorizeRoles(2,5,6, 8,9,10), // SUPPORT_STAFF + DEPT_TECHNICIAN
  async (req, res) => {
    try {
      const complaint_id = req.params.id;
      const staff_id = req.user.id;

      const complaintResult = await pool.query(
        "SELECT * FROM complaints WHERE id = $1",
        [complaint_id]
      );

      if (complaintResult.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      const complaint = complaintResult.rows[0];

      if (complaint.status !== "OPEN") {
        return res.status(400).json({ error: "Complaint already taken or resolved" });
      }

      const result = await pool.query(
        `UPDATE complaints
         SET status = 'IN_PROGRESS',
             assigned_to = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [staff_id, complaint_id]
      );

      res.json({
        message: "Complaint accepted successfully",
        complaint: result.rows[0]
      });

    } catch (err) {
      console.error("Accept Complaint Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

//resolve complaints
// PUT /complaints/:id/resolve
app.put(
  "/complaints/:id/resolve",
  authenticateToken,
  authorizeRoles(2, 5, 6, 7, 8, 9, 10),
  async (req, res) => {
    try {
      const user_id  = req.user.id
      const role_id  = req.user.role_id
      const complaint_id = req.params.id
 
      const complaintResult = await pool.query(
        `SELECT c.*, cc.routing_type, cc.routed_department_id
         FROM complaints c
         JOIN complaint_categories cc ON c.category_id = cc.id
         WHERE c.id = $1`,
        [complaint_id]
      )
 
      if (complaintResult.rows.length === 0)
        return res.status(404).json({ error: "Complaint not found" })
 
      const complaint = complaintResult.rows[0]
 
      // Roles 2, 5, 8 — must be assigned to the complaint
      if ([2, 5, 8].includes(role_id)) {
        if (complaint.assigned_to !== user_id)
          return res.status(403).json({ error: "You can only resolve complaints assigned to you" })
      }
 
      // Role 6 (Hostel Manager) — can resolve any hostel complaint
      if (role_id === 6 && complaint.routing_type !== 'HOSTEL')
        return res.status(403).json({ error: "You can only resolve hostel complaints" })
 
      // Role 9 (Librarian) — can resolve any library complaint
      if (role_id === 9 && complaint.routed_department_id !== 5)
        return res.status(403).json({ error: "You can only resolve library complaints" })
 
      // Role 10 (Transport Manager) — can resolve any transport complaint
      if (role_id === 10 && complaint.routed_department_id !== 6)
        return res.status(403).json({ error: "You can only resolve transport complaints" })
 
      // Role 7 (Admin) — can resolve anything (no extra check)
 
      const result = await pool.query(
        `UPDATE complaints SET status = 'RESOLVED', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [complaint_id]
      )
 
      res.json({ message: "Complaint resolved successfully", complaint: result.rows[0] })
    } catch (err) {
      console.error("Resolve Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)
 





// ── 1. GET /staff/complaints ─────────────────────────────────
app.get(
  "/staff/complaints",
  authenticateToken,
  authorizeRoles(2, 5, 6, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;
      const role_id = req.user.role_id;
      let complaints;
 
      // WARDEN (role 5) → open HOSTEL complaints
      if (role_id === 5) {
        complaints = await pool.query(`
          SELECT c.*, cc.name AS category, (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          WHERE c.complaint_scope = 'HOSTEL'
            AND c.status = 'OPEN'
          ORDER BY c.upvote_count DESC, c.created_at DESC
        `);
      }
 
      // HOSTEL MANAGER (role 6) → all hostel complaints
      else if (role_id === 6) {
        complaints = await pool.query(`
          SELECT c.*, cc.name AS category
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          WHERE c.complaint_scope = 'HOSTEL'
          ORDER BY c.created_at DESC
        `);
      }
 
      // SUPPORT STAFF (role 2) → FIXED_DEPARTMENT complaints for their dept
      // Handles: Electrical→EEE, Plumbing/Carpentry→Mechanical,
      //          Civil→Civil, Library→Library, Transport→Transport
      else if (role_id === 2) {
        const staffResult = await pool.query(
          "SELECT department_id FROM users WHERE id = $1",
          [staff_id]
        );
        const dept_id = staffResult.rows[0]?.department_id;
 
        complaints = await pool.query(`
          SELECT c.*, cc.name AS category
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          WHERE c.status = 'OPEN'
            AND cc.routing_type = 'FIXED_DEPARTMENT'
            AND cc.routed_department_id = $1
          ORDER BY c.upvote_count DESC, c.created_at DESC
        `, [dept_id]);
      }
 
      // DEPT_TECHNICIAN (role 8) → IT Support complaints from their dept's students
      else if (role_id === 8) {
        const techResult = await pool.query(
          "SELECT department_id FROM users WHERE id = $1",
          [staff_id]
        );
        const dept_id = techResult.rows[0]?.department_id;
 
        complaints = await pool.query(`
          SELECT c.*, cc.name AS category
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          JOIN users student ON c.student_id = student.id
          WHERE c.status = 'OPEN'
            AND cc.routing_type = 'STUDENT_DEPARTMENT'
            AND student.department_id = $1
          ORDER BY c.upvote_count DESC, c.created_at DESC
        `, [dept_id]);
      }
 
      res.json({ complaints: complaints.rows });
 
    } catch (err) {
      console.error("Fetch Staff Complaints Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
 
 
// ── 2. GET /staff/my-complaints ──────────────────────────────
// Returns IN_PROGRESS and ESCALATED complaints assigned to the logged-in staff
// Also returns chain_escalated flag so frontend knows if already escalated
app.get(
  "/staff/my-complaints",
  authenticateToken,
  authorizeRoles(2, 5, 6, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;
 
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
          ce.id IS NOT NULL AS chain_escalated
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        LEFT JOIN complaint_escalations ce
          ON ce.complaint_id = c.id AND ce.escalated_by = $1
        WHERE c.assigned_to = $1
          AND c.status IN ('IN_PROGRESS', 'ESCALATED')
        ORDER BY c.updated_at DESC
      `, [staff_id]);
 
      res.json({ complaints: complaints.rows });
 
    } catch (err) {
      console.error("Fetch My Complaints Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


  app.post(
    "/complaints/:id/toggle-upvote",
    authenticateToken,
    authorizeRoles(1), // students
    async (req, res) => {
      try {
        const complaintId = req.params.id;
        const studentId = req.user.id;
  
        // check if already upvoted
        const existing = await pool.query(
          `SELECT * FROM complaint_upvotes
           WHERE complaint_id=$1 AND student_id=$2`,
          [complaintId, studentId]
        );
  
        // IF NOT UPVOTED → ADD
        if (existing.rows.length === 0) {
  
          await pool.query(
            `INSERT INTO complaint_upvotes (complaint_id, student_id)
             VALUES ($1,$2)`,
            [complaintId, studentId]
          );
  
          await pool.query(
            `UPDATE complaints
             SET upvote_count = upvote_count + 1
             WHERE id=$1`,
            [complaintId]
          );
  
          return res.json({
            message: "Upvoted",
            upvoted: true
          });
        }
  
        // IF ALREADY UPVOTED → REMOVE
        else {
  
          await pool.query(
            `DELETE FROM complaint_upvotes
             WHERE complaint_id=$1 AND student_id=$2`,
            [complaintId, studentId]
          );
  
          await pool.query(
            `UPDATE complaints
             SET upvote_count = upvote_count - 1
             WHERE id=$1`,
            [complaintId]
          );
  
          return res.json({
            message: "Upvote removed",
            upvoted: false
          });
        }
  
      } catch (err) {
        console.error("Toggle Upvote Error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );
  


// ── 1. GET /staff/resolved-complaints ───────────────────────
// Support staff / dept technician view their own resolved complaints
app.get(
  "/staff/resolved-complaints",
  authenticateToken,
  authorizeRoles(2, 5, 6, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;

      const complaints = await pool.query(`
        SELECT c.*, cc.name AS category
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        WHERE c.assigned_to = $1
          AND c.status = 'RESOLVED'
        ORDER BY c.updated_at DESC
      `, [staff_id]);

      res.json({ complaints: complaints.rows });
    } catch (err) {
      console.error("Resolved Complaints Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


app.get(
  "/coordinator/complaints",
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {
    try {
      const coordinator_id = req.user.id;
 
      // Get coordinator's department
      const coordResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1",
        [coordinator_id]
      );
      const dept_id = coordResult.rows[0]?.department_id;
 
      // Get all complaints routed to this department
      // FIXED_DEPARTMENT → routed_department_id matches
      // STUDENT_DEPARTMENT (IT Support) → student's dept matches
      // Exclude HOSTEL routing_type
      const complaints = await pool.query(`
       SELECT
  c.*,
  cc.name AS category,
  cc.routing_type,
  u.name AS student_name,
  u.email AS student_email,
  assigned.name AS assigned_to_name,
  (c.upvote_count * 2) + (cc.severity * 10) +
  (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score
FROM complaints c
JOIN complaint_categories cc ON c.category_id = cc.id
JOIN users u ON c.student_id = u.id
LEFT JOIN users assigned ON c.assigned_to = assigned.id
WHERE u.department_id = $1 and cc.name NOT IN ('Hostel','Transport','Library')
ORDER BY c.created_at DESC;
      `, [dept_id]);
 
      res.json({ complaints: complaints.rows });
    } catch (err) {
      console.error("Coordinator Complaints Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);
 


// ── 3. POST /coordinator/complaints/:id/remind ───────────────
// Coordinator sends a reminder for an OPEN (unassigned) complaint
app.post(
  "/coordinator/complaints/:id/remind",
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {
    try {
      const complaint_id = req.params.id;
      const coordinator_id = req.user.id;
      const { message } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: "Reminder message is required" });
      }

      // Only allow reminders on OPEN (unassigned) complaints
      const complaintResult = await pool.query(
        "SELECT * FROM complaints WHERE id = $1",
        [complaint_id]
      );

      if (complaintResult.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      const complaint = complaintResult.rows[0];

      if (complaint.status !== 'OPEN') {
        return res.status(400).json({
          error: "Reminders can only be sent for OPEN complaints not yet accepted by staff"
        });
      }

      const result = await pool.query(
        `INSERT INTO reminders (complaint_id, sent_by, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [complaint_id, coordinator_id, message.trim()]
      );

      res.json({
        message: "Reminder sent successfully",
        reminder: result.rows[0]
      });
    } catch (err) {
      console.error("Send Reminder Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 4. GET /staff/reminders ──────────────────────────────────
// Support staff / dept technician view reminders for complaints in their dept
app.get(
  "/staff/reminders",
  authenticateToken,
  authorizeRoles(2, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;
      const role_id = req.user.role_id;

      const staffResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1",
        [staff_id]
      );
      const dept_id = staffResult.rows[0]?.department_id;

      // Fetch reminders for complaints routed to this staff's department
      const reminders = await pool.query(`
        SELECT
          r.*,
          c.title AS complaint_title,
          c.status AS complaint_status,
          c.description AS complaint_description,
          cc.name AS category,
          sender.name AS sent_by_name,
          sender.email AS sent_by_email
        FROM reminders r
        JOIN complaints c ON r.complaint_id = c.id
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users sender ON r.sent_by = sender.id
        JOIN users student ON c.student_id = student.id
        WHERE (
          ${role_id === 8
            ? `cc.routing_type = 'STUDENT_DEPARTMENT' AND student.department_id = $1`
            : `cc.routing_type = 'FIXED_DEPARTMENT' AND cc.routed_department_id = $1`
          }
        )
        ORDER BY r.created_at DESC
      `, [dept_id]);

      res.json({ reminders: reminders.rows });
    } catch (err) {
      console.error("Fetch Reminders Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 5. PUT /staff/reminders/:id/read ────────────────────────
// Staff marks a reminder as read
app.put(
  "/staff/reminders/:id/read",
  authenticateToken,
  authorizeRoles(2, 8),
  async (req, res) => {
    try {
      const reminder_id = req.params.id;

      await pool.query(
        "UPDATE reminders SET is_read = TRUE WHERE id = $1",
        [reminder_id]
      );

      res.json({ message: "Reminder marked as read" });
    } catch (err) {
      console.error("Mark Read Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── 1. GET /coordinator/reminders ───────────────────────────
// Coordinator views all reminders they sent + staff replies
app.get(
  "/coordinator/reminders",
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {
    try {
      const coordinator_id = req.user.id;

      const reminders = await pool.query(`
        SELECT
          r.*,
          c.title AS complaint_title,
          c.status AS complaint_status,
          cc.name AS category,
          u.name AS sent_to_dept
        FROM reminders r
        JOIN complaints c ON r.complaint_id = c.id
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users coord ON r.sent_by = coord.id
        LEFT JOIN departments u ON cc.routed_department_id = u.id
        WHERE r.sent_by = $1
        ORDER BY r.created_at DESC
      `, [coordinator_id]);

      // For each reminder, fetch its replies
      const reminderIds = reminders.rows.map(r => r.id);
      let replies = { rows: [] };
      if (reminderIds.length > 0) {
        replies = await pool.query(`
          SELECT
            rr.*,
            u.name AS replied_by_name,
            u.role_id AS replied_by_role
          FROM reminder_replies rr
          JOIN users u ON rr.replied_by = u.id
          WHERE rr.reminder_id = ANY($1::int[])
          ORDER BY rr.created_at ASC
        `, [reminderIds]);
      }

      // Attach replies to each reminder
      const repliesByReminder = {};
      replies.rows.forEach(r => {
        if (!repliesByReminder[r.reminder_id]) repliesByReminder[r.reminder_id] = [];
        repliesByReminder[r.reminder_id].push(r);
      });

      const result = reminders.rows.map(r => ({
        ...r,
        replies: repliesByReminder[r.id] || []
      }));

      res.json({ reminders: result });
    } catch (err) {
      console.error("Coordinator Reminders Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 2. GET /staff/reminders (updated with replies) ───────────
// Already exists — replace with this version that includes replies
app.get(
  "/staff/reminders",
  authenticateToken,
  authorizeRoles(2, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;
      const role_id = req.user.role_id;

      const staffResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1", [staff_id]
      );
      const dept_id = staffResult.rows[0]?.department_id;

      const routingCondition = role_id === 8
        ? `cc.routing_type = 'STUDENT_DEPARTMENT' AND student.department_id = $1`
        : `cc.routing_type = 'FIXED_DEPARTMENT' AND cc.routed_department_id = $1`;

      const reminders = await pool.query(`
        SELECT
          r.*,
          c.title AS complaint_title,
          c.status AS complaint_status,
          c.description AS complaint_description,
          cc.name AS category,
          sender.name AS sent_by_name,
          sender.email AS sent_by_email
        FROM reminders r
        JOIN complaints c ON r.complaint_id = c.id
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users sender ON r.sent_by = sender.id
        JOIN users student ON c.student_id = student.id
        WHERE (${routingCondition})
        ORDER BY r.created_at DESC
      `, [dept_id]);

      // Fetch replies for each reminder
      const reminderIds = reminders.rows.map(r => r.id);
      let replies = { rows: [] };
      if (reminderIds.length > 0) {
        replies = await pool.query(`
          SELECT rr.*, u.name AS replied_by_name
          FROM reminder_replies rr
          JOIN users u ON rr.replied_by = u.id
          WHERE rr.reminder_id = ANY($1::int[])
          ORDER BY rr.created_at ASC
        `, [reminderIds]);
      }

      const repliesByReminder = {};
      replies.rows.forEach(r => {
        if (!repliesByReminder[r.reminder_id]) repliesByReminder[r.reminder_id] = [];
        repliesByReminder[r.reminder_id].push(r);
      });

      const result = reminders.rows.map(r => ({
        ...r,
        replies: repliesByReminder[r.id] || []
      }));

      res.json({ reminders: result });
    } catch (err) {
      console.error("Fetch Reminders Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 3. POST /staff/reminders/:id/reply ──────────────────────
// Staff replies to a reminder
app.post(
  "/staff/reminders/:id/reply",
  authenticateToken,
  authorizeRoles(2, 8),
  async (req, res) => {
    try {
      const reminder_id = req.params.id;
      const staff_id = req.user.id;
      const { message } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: "Reply message is required" });
      }

      // Verify reminder exists
      const reminderCheck = await pool.query(
        "SELECT * FROM reminders WHERE id = $1", [reminder_id]
      );
      if (reminderCheck.rows.length === 0) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      const result = await pool.query(
        `INSERT INTO reminder_replies (reminder_id, replied_by, message)
         VALUES ($1, $2, $3) RETURNING *`,
        [reminder_id, staff_id, message.trim()]
      );

      // Also mark the reminder as read when staff replies
      await pool.query(
        "UPDATE reminders SET is_read = TRUE WHERE id = $1", [reminder_id]
      );

      res.json({ message: "Reply sent", reply: result.rows[0] });
    } catch (err) {
      console.error("Reply Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 4. POST /coordinator/complaints/:id/escalate ─────────────
// Coordinator escalates a complaint to HOD of their department
app.post(
  "/coordinator/complaints/:id/escalate",
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {
    try {
      const complaint_id = req.params.id;
      const coordinator_id = req.user.id;
      const { reason, message } = req.body;

      if (!reason?.trim() || !message?.trim()) {
        return res.status(400).json({ error: "Reason and message are required" });
      }

      // Get coordinator's department
      const coordResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1", [coordinator_id]
      );
      const dept_id = coordResult.rows[0]?.department_id;

      // Get the complaint and validate
      const complaintResult = await pool.query(
        `SELECT c.*, cc.routing_type FROM complaints c
         JOIN complaint_categories cc ON c.category_id = cc.id
         WHERE c.id = $1`,
        [complaint_id]
      );

      if (complaintResult.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      const complaint = complaintResult.rows[0];

      // Block hostel complaints
      if (complaint.routing_type === 'HOSTEL') {
        return res.status(400).json({ error: "Hostel complaints cannot be escalated" });
      }

      // Only OPEN or IN_PROGRESS can be escalated
      if (!['OPEN', 'IN_PROGRESS'].includes(complaint.status)) {
        return res.status(400).json({ error: "Only OPEN or IN_PROGRESS complaints can be escalated" });
      }

      // Check not already escalated
      const existingEscalation = await pool.query(
        "SELECT id FROM escalations WHERE complaint_id = $1", [complaint_id]
      );
      if (existingEscalation.rows.length > 0) {
        return res.status(400).json({ error: "This complaint has already been escalated" });
      }

      // Find HOD of the coordinator's department
      const hodResult = await pool.query(
        "SELECT id FROM users WHERE role_id = 4 AND department_id = $1 LIMIT 1",
        [dept_id]
      );

      if (hodResult.rows.length === 0) {
        return res.status(404).json({ error: "No HOD found for your department" });
      }

      const hod_id = hodResult.rows[0].id;

      // Insert escalation
      const escalation = await pool.query(
        `INSERT INTO escalations (complaint_id, escalated_by, hod_id, reason, message)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [complaint_id, coordinator_id, hod_id, reason.trim(), message.trim()]
      );

      // Update complaint status to ESCALATED
      await pool.query(
        "UPDATE complaints SET status = 'ESCALATED', updated_at = NOW() WHERE id = $1",
        [complaint_id]
      );

      res.json({
        message: "Complaint escalated to HOD successfully",
        escalation: escalation.rows[0]
      });
    } catch (err) {
      console.error("Escalate Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 5. GET /hod/complaints ───────────────────────────────────
// HOD views all complaints of their department

app.get(
  "/hod/complaints",
  authenticateToken,
  authorizeRoles(4),
  async (req, res) => {
    try {
      const hod_id = req.user.id;
 
      const hodResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1", [hod_id]
      );
      const dept_id = hodResult.rows[0]?.department_id;
 
      const complaints = await pool.query(`
        SELECT
  c.*,
  cc.name AS category,
  cc.routing_type,
  u.name AS student_name,
  u.email AS student_email,
  assigned.name AS assigned_to_name,
  (c.upvote_count * 2) + (cc.severity * 10) +
  (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
  escalations.reason AS escalation_reason,
  escalations.message AS escalation_message,
  escalations.created_at AS escalated_at,
  escalator.name AS escalated_by_name,
  ae.id AS admin_escalation_id,
  ae.created_at AS admin_escalated_at
FROM complaints c
JOIN complaint_categories cc ON c.category_id = cc.id
JOIN users u ON c.student_id = u.id
LEFT JOIN users assigned ON c.assigned_to = assigned.id
LEFT JOIN escalations ON escalations.complaint_id = c.id
LEFT JOIN users escalator ON escalations.escalated_by = escalator.id
LEFT JOIN admin_escalations ae ON ae.complaint_id = c.id
WHERE u.department_id = $1 AND cc.name NOT IN ('Hostel', 'Transport', 'Library')
ORDER BY
  CASE WHEN c.status = 'ESCALATED' THEN 0 ELSE 1 END,
  c.created_at DESC;
      `, [dept_id]);
 
      res.json({ complaints: complaints.rows });
    } catch (err) {
      console.error("HOD Complaints Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// ── 6. PUT /hod/escalations/:id/read ────────────────────────
// HOD marks an escalation as read
app.put(
  "/hod/escalations/:id/read",
  authenticateToken,
  authorizeRoles(4),
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE escalations SET is_read = TRUE WHERE id = $1", [req.params.id]
      );
      res.json({ message: "Marked as read" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


app.get(
  "/staff/escalated-complaints",
  authenticateToken,
  authorizeRoles(2, 5, 8),
  async (req, res) => {
    try {
      const staff_id = req.user.id;
      const role_id  = req.user.role_id;
 
      // WARDEN (role 5) — hostel complaints they escalated via complaint_escalations
      if (role_id === 5) {
        const complaints = await pool.query(`
          SELECT
            c.*,
            cc.name AS category,
            ce.reason      AS escalation_reason,
            ce.message     AS escalation_message,
            ce.created_at  AS escalated_at
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          JOIN complaint_escalations ce ON ce.complaint_id = c.id
          WHERE ce.escalated_by = $1
            AND ce.from_role = 5
            AND c.status = 'ESCALATED'
          ORDER BY ce.created_at DESC
        `, [staff_id]);
        return res.json({ complaints: complaints.rows });
      }
 
      // SUPPORT_STAFF (role 2) — library/transport use complaint_escalations
      // DEPT_TECHNICIAN (role 8) — uses old escalations table (coordinator→HOD flow)
      const staffResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1", [staff_id]
      );
      const dept_id = staffResult.rows[0]?.department_id;
 
      // Library (dept 5) and Transport (dept 6) escalate via complaint_escalations chain
      if (role_id === 2 && [5, 6].includes(dept_id)) {
        const complaints = await pool.query(`
          SELECT
            c.*,
            cc.name AS category,
            ce.reason     AS escalation_reason,
            ce.message    AS escalation_message,
            ce.created_at AS escalated_at
          FROM complaints c
          JOIN complaint_categories cc ON c.category_id = cc.id
          JOIN complaint_escalations ce ON ce.complaint_id = c.id
          WHERE ce.escalated_by = $1
            AND ce.from_role = 2
            AND c.status = 'ESCALATED'
          ORDER BY ce.created_at DESC
        `, [staff_id]);
        return res.json({ complaints: complaints.rows });
      }
 
      // Other role 2 staff and role 8 — escalated via coordinator (old escalations table)
      const routingCondition = role_id === 8
        ? `cc.routing_type = 'STUDENT_DEPARTMENT' AND student.department_id = $1`
        : `cc.routing_type = 'FIXED_DEPARTMENT' AND cc.routed_department_id = $1`;
 
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          e.reason AS escalation_reason,
          e.message AS escalation_message,
          e.created_at AS escalated_at,
          escalator.name AS escalated_by_name
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users student ON c.student_id = student.id
        JOIN escalations e ON e.complaint_id = c.id
        JOIN users escalator ON e.escalated_by = escalator.id
        WHERE c.status = 'ESCALATED'
          AND c.assigned_to = $2
          AND (${routingCondition})
        ORDER BY e.created_at DESC
      `, [dept_id, staff_id]);
 
      res.json({ complaints: complaints.rows });
    } catch (err) {
      console.error("Staff Escalated Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);
 

// ── 8. GET /coordinator/escalated-complaints ─────────────────
// Coordinator sees complaints they escalated
app.get(
  "/coordinator/escalated-complaints",
  authenticateToken,
  authorizeRoles(3),
  async (req, res) => {
    try {
      const coordinator_id = req.user.id;

      const complaints = await pool.query(`
        SELECT
  c.*,
  cc.name AS category,
  e.reason AS escalation_reason,
  e.message AS escalation_message,
  e.created_at AS escalated_at,
  hod.name AS hod_name,
  assigned.name AS assigned_to_name,
  student.name AS student_name
FROM complaints c
JOIN complaint_categories cc ON c.category_id = cc.id
JOIN users student ON c.student_id = student.id
LEFT JOIN users assigned ON c.assigned_to = assigned.id
JOIN escalations e ON e.complaint_id = c.id
JOIN users hod ON e.hod_id = hod.id
WHERE 
  e.escalated_by = $1
ORDER BY e.created_at DESC;
      `, [coordinator_id]);

      res.json({ complaints: complaints.rows });
    } catch (err) {
      console.error("Coordinator Escalated Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);




// ── 1. GET /admin/stats ──────────────────────────────────────
app.get("/admin/stats", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const [overall, today, weekly, monthly, byStatus, avgResolution] = await Promise.all([

      // Total complaints
      pool.query(`SELECT COUNT(*) AS total FROM complaints`),

      // Today
      pool.query(`SELECT COUNT(*) AS total FROM complaints WHERE created_at >= CURRENT_DATE`),

      // This week
      pool.query(`SELECT COUNT(*) AS total FROM complaints WHERE created_at >= date_trunc('week', NOW())`),

      // This month
      pool.query(`SELECT COUNT(*) AS total FROM complaints WHERE created_at >= date_trunc('month', NOW())`),

      // By status
      pool.query(`
        SELECT status, COUNT(*) AS count
        FROM complaints
        GROUP BY status
      `),

      // Avg resolution time in hours (only resolved complaints)
      pool.query(`
        SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)::numeric, 1) AS avg_hours
        FROM complaints
        WHERE status = 'RESOLVED'
      `),
    ])

    const statusCounts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, ESCALATED: 0 }
    byStatus.rows.forEach(r => { statusCounts[r.status] = parseInt(r.count) })

    const total = parseInt(overall.rows[0].total)
    const resolved = statusCounts.RESOLVED
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    res.json({
      total,
      today: parseInt(today.rows[0].total),
      weekly: parseInt(weekly.rows[0].total),
      monthly: parseInt(monthly.rows[0].total),
      statusCounts,
      resolutionRate,
      avgResolutionHours: parseFloat(avgResolution.rows[0].avg_hours) || 0,
    })
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ error: err.message })
  }
})


// ── 2. GET /admin/trends ─────────────────────────────────────

app.get("/admin/trends", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const [submitted, resolved, totalPending] = await Promise.all([
      // Submitted per day (last 30 days)
      pool.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
        FROM complaints
        WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `),
      // Resolved per day (last 30 days)
      pool.query(`
        SELECT TO_CHAR(updated_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
        FROM complaints
        WHERE status = 'RESOLVED'
          AND updated_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY TO_CHAR(updated_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `),
      // Total pending (not resolved) AS OF TODAY — single number
      // We use this as baseline then work backwards using daily submitted/resolved
      pool.query(`
        SELECT COUNT(*) AS count FROM complaints WHERE status != 'RESOLVED'
      `)
    ])
 
    // Build last 30 days as YYYY-MM-DD strings
    const days = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const yyyy = d.getFullYear()
      const mm   = String(d.getMonth() + 1).padStart(2, '0')
      const dd   = String(d.getDate()).padStart(2, '0')
      days.push(`${yyyy}-${mm}-${dd}`)
    }
 
    const submittedMap = {}
    submitted.rows.forEach(r => { submittedMap[r.date] = parseInt(r.count) })
    const resolvedMap = {}
    resolved.rows.forEach(r => { resolvedMap[r.date] = parseInt(r.count) })
 
    // Calculate pending per day:
    // Start from today's actual pending count and walk BACKWARDS
    // pending[today] = totalPending
    // pending[yesterday] = pending[today] - submitted[today] + resolved[today]
    let pendingToday = parseInt(totalPending.rows[0].count)
    const pendingMap = {}
    for (let i = days.length - 1; i >= 0; i--) {
      const date = days[i]
      pendingMap[date] = pendingToday
      // going back one more day: undo today's submissions, undo today's resolutions
      pendingToday = pendingToday - (submittedMap[date] || 0) + (resolvedMap[date] || 0)
      if (pendingToday < 0) pendingToday = 0
    }
 
    const trends = days.map(date => ({
      date,
      submitted: submittedMap[date] || 0,
      resolved:  resolvedMap[date]  || 0,
      pending:   pendingMap[date]   || 0,
    }))
 
    res.json({ trends })
  } catch (err) {
    console.error("Admin Trends Error:", err)
    res.status(500).json({ error: err.message })
  }
})



app.get("/admin/trends", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const [submitted, resolved] = await Promise.all([
      pool.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
        FROM complaints
        WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `),
      pool.query(`
        SELECT TO_CHAR(updated_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
        FROM complaints
        WHERE status = 'RESOLVED'
          AND updated_at >= CURRENT_DATE - INTERVAL '29 days'
        GROUP BY TO_CHAR(updated_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `)
    ])
 
    // Build last 30 days as YYYY-MM-DD strings using server local date
    // We let PostgreSQL define "today" via CURRENT_DATE, and mirror that in JS
    const days = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const yyyy = d.getFullYear()
      const mm   = String(d.getMonth() + 1).padStart(2, '0')
      const dd   = String(d.getDate()).padStart(2, '0')
      days.push(`${yyyy}-${mm}-${dd}`)
    }
 
    // TO_CHAR returns plain strings — direct map lookup
    const submittedMap = {}
    submitted.rows.forEach(r => { submittedMap[r.date] = parseInt(r.count) })
    const resolvedMap = {}
    resolved.rows.forEach(r => { resolvedMap[r.date] = parseInt(r.count) })
 
    const trends = days.map(date => ({
      date,
      submitted: submittedMap[date] || 0,
      resolved:  resolvedMap[date]  || 0,
    }))
 
    res.json({ trends })
  } catch (err) {
    console.error("Admin Trends Error:", err)
    res.status(500).json({ error: err.message })
  }
})


//3 department-stats
app.get("/admin/department-stats", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        d.id,
        d.name AS department,
        COUNT(c.id)                                                          AS total,
        SUM(CASE WHEN c.status = 'OPEN'        THEN 1 ELSE 0 END)           AS open,
        SUM(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)           AS in_progress,
        SUM(CASE WHEN c.status = 'RESOLVED'    THEN 1 ELSE 0 END)           AS resolved,
        SUM(CASE WHEN c.status = 'ESCALATED'   THEN 1 ELSE 0 END)           AS escalated,
        ROUND(
          AVG(CASE WHEN c.status = 'RESOLVED'
            THEN EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 3600
          END)::numeric, 1
        )                                                                    AS avg_resolution_hours
      FROM departments d
      LEFT JOIN (
        SELECT
          c.id, c.status, c.created_at, c.updated_at,
          c.student_id, cc.routing_type, cc.routed_department_id
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
      ) c ON (
        (c.routing_type = 'FIXED_DEPARTMENT' AND c.routed_department_id = d.id)
        OR
        (c.routing_type = 'STUDENT_DEPARTMENT' AND EXISTS (
          SELECT 1 FROM users u WHERE u.id = c.student_id AND u.department_id = d.id
        ))
      )
      GROUP BY d.id, d.name
      ORDER BY total DESC NULLS LAST
    `)
 
    // Add hostel complaints row separately (routing_type = 'HOSTEL', no dept)
    const hostel = await pool.query(`
      SELECT
        COUNT(c.id)                                                AS total,
        SUM(CASE WHEN c.status = 'OPEN'        THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN c.status = 'RESOLVED'    THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN c.status = 'ESCALATED'   THEN 1 ELSE 0 END) AS escalated,
        ROUND(
          AVG(CASE WHEN c.status = 'RESOLVED'
            THEN EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 3600
          END)::numeric, 1
        ) AS avg_resolution_hours
      FROM complaints c
      JOIN complaint_categories cc ON c.category_id = cc.id
      WHERE cc.routing_type = 'HOSTEL'
    `)
 
    const hostelRow = {
      id: 0,
      department: 'Hostel',
      ...hostel.rows[0],
    }
 
    const departments = [hostelRow, ...stats.rows].sort(
      (a, b) => (parseInt(b.total) || 0) - (parseInt(a.total) || 0)
    )
 
    res.json({ departments })
  } catch (err) {
    console.error("Dept Stats Error:", err)
    res.status(500).json({ error: err.message })
  }
})




// ── 4. GET /admin/escalations ────────────────────────────────
app.get("/admin/escalations", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const escalations = await pool.query(`
      SELECT
        e.*,
        c.title AS complaint_title,
        c.status AS complaint_status,
        cc.name AS category,
        coordinator.name AS escalated_by_name,
        hod.name AS hod_name,
        d.name AS department
      FROM escalations e
      JOIN complaints c ON e.complaint_id = c.id
      JOIN complaint_categories cc ON c.category_id = cc.id
      JOIN users coordinator ON e.escalated_by = coordinator.id
      JOIN users hod ON e.hod_id = hod.id
      LEFT JOIN departments d ON coordinator.department_id = d.id
      ORDER BY e.created_at DESC
    `)

    res.json({ escalations: escalations.rows })
  } catch (err) {
    console.error("Admin Escalations Error:", err);
    res.status(500).json({ error: err.message })
  }
})


// ── 5. GET /admin/users ──────────────────────────────────────
app.get("/admin/users", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT
        u.id, u.name, u.email, u.is_active, u.created_at,
        r.name AS role,
        d.name AS department,
        COUNT(c.id) AS complaints_resolved
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN complaints c ON c.assigned_to = u.id AND c.status = 'RESOLVED'
      GROUP BY u.id, u.name, u.email, u.is_active, u.created_at, r.name, d.name
      ORDER BY r.name, u.name
    `)

    res.json({ users: users.rows })
  } catch (err) {
    console.error("Admin Users Error:", err);
    res.status(500).json({ error: err.message })
  }
})


// ── 6. PUT /admin/users/:id/toggle-active ────────────────────
app.put("/admin/users/:id/toggle-active", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active`,
      [req.params.id]
    )
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error("Toggle Active Error:", err);
    res.status(500).json({ error: err.message })
  }
})


// ── 7. GET /admin/activity ───────────────────────────────────


app.get("/admin/activity", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const { category, status, from, to } = req.query
 
    const conditions = []
    const params     = []
 
    if (category) {
      params.push(category)
      conditions.push(`cc.name = $${params.length}`)
    }
    if (status) {
      params.push(status)
      conditions.push(`c.status = $${params.length}`)
    }
    if (from) {
      params.push(from)
      conditions.push(`DATE(c.created_at) >= $${params.length}`)
    }
    if (to) {
      params.push(to)
      conditions.push(`DATE(c.created_at) <= $${params.length}`)
    }
 
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
 
    const activity = await pool.query(`
      SELECT
        c.id, c.title, c.description, c.status,
        c.upvote_count, c.updated_at, c.created_at,
        cc.name AS category,
        (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
        student.name AS student_name,
        assigned.name AS assigned_to_name
      FROM complaints c
      JOIN complaint_categories cc ON c.category_id = cc.id
      JOIN users student ON c.student_id = student.id
      LEFT JOIN users assigned ON c.assigned_to = assigned.id
      ${where}
      ORDER BY c.created_at DESC
    `, params)
 
    res.json({ activity: activity.rows, total: activity.rows.length })
  } catch (err) {
    console.error("Admin Activity Error:", err)
    res.status(500).json({ error: err.message })
  }
})





app.put("/admin/complaints/:id/resolve", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE complaints SET status = 'RESOLVED', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: "Complaint not found" })
    res.json({ complaint: result.rows[0], message: "Complaint resolved successfully" })
  } catch (err) {
    console.error("Admin Resolve Error:", err)
    res.status(500).json({ error: err.message })
  }
})
 

app.post(
  "/hod/complaints/:id/escalate",
  authenticateToken,
  authorizeRoles(4),
  async (req, res) => {
    try {
      const hod_id = req.user.id
      const complaint_id = req.params.id
      const { reason, message } = req.body
 
      if (!reason || !message?.trim()) {
        return res.status(400).json({ error: "Reason and message are required" })
      }
 
      // Check complaint exists
      const complaint = await pool.query(
        "SELECT * FROM complaints WHERE id = $1", [complaint_id]
      )
      if (complaint.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" })
      }
 
      // Check not already escalated to admin
      const existing = await pool.query(
        "SELECT id FROM admin_escalations WHERE complaint_id = $1", [complaint_id]
      )
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Already escalated to Admin" })
      }
 
      const escalation = await pool.query(
        `INSERT INTO admin_escalations (complaint_id, escalated_by, reason, message)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [complaint_id, hod_id, reason, message]
      )
      
      // Update complaint status to ESCALATED
      await pool.query(
        `UPDATE complaints SET status = 'ESCALATED', updated_at = NOW() WHERE id = $1`,
        [complaint_id]
      )

      res.json({
        message: "Complaint escalated to Admin successfully",
        escalation: escalation.rows[0]
      })
    } catch (err) {
      console.error("HOD Escalate Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)
 
 
// ── 10. GET /admin/escalations (UPDATED) ─────────────────────
// Replace your existing /admin/escalations route with this one
// Now shows BOTH coordinator→HOD escalations AND HOD→Admin escalations
// The route in admin_backend.js route #4 above should be replaced by this:
 
app.get("/admin/hod-escalations", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const escalations = await pool.query(`
      SELECT
        ae.*,
        c.title        AS complaint_title,
        c.description  AS complaint_description,
        c.status       AS complaint_status,
        c.upvote_count,
        c.created_at   AS complaint_created_at,
        cc.name        AS category,
        hod.name       AS escalated_by_name,
        d.name         AS department,
        assigned.name  AS assigned_to_name,
        student.name   AS student_name
      FROM admin_escalations ae
      JOIN complaints c            ON ae.complaint_id = c.id
      JOIN complaint_categories cc ON c.category_id = cc.id
      JOIN users hod               ON ae.escalated_by = hod.id
      LEFT JOIN departments d      ON hod.department_id = d.id
      LEFT JOIN users assigned     ON c.assigned_to = assigned.id
      LEFT JOIN users student      ON c.student_id = student.id
      ORDER BY ae.created_at DESC
    `)
    res.json({ escalations: escalations.rows })
  } catch (err) {
    console.error("Admin HOD Escalations Error:", err)
    res.status(500).json({ error: err.message })
  }
}) 

const ESCALATION_TARGETS = {
  5:  6,   // Warden → Hostel Manager
  6:  7,   // Hostel Manager → Admin
  9:  7,   // Librarian → Admin
  10: 7,   // Transport Manager → Admin
  // role 2 (support staff) handled dynamically by dept
}

// dept_id → escalation target role
const DEPT_ESCALATION_TARGET = {
  5: 9,   // Library dept → Librarian
  6: 10,  // Transport dept → Transport Manager
}


// ── 1. POST /complaints/:id/escalate-chain ───────────────────
// Universal escalation endpoint for all chain roles
app.post(
  "/complaints/:id/escalate-chain",
  authenticateToken,
  authorizeRoles(2, 5, 6, 9, 10),
  async (req, res) => {
    try {
      const user_id  = req.user.id
      const role_id  = req.user.role_id
      const complaint_id = req.params.id
      const { reason, message } = req.body

      if (!reason || !message?.trim()) {
        return res.status(400).json({ error: "Reason and message are required" })
      }

      // Get user dept for role 2
      const userResult = await pool.query(
        "SELECT department_id FROM users WHERE id = $1", [user_id]
      )
      const dept_id = userResult.rows[0]?.department_id

      // Determine to_role
      let to_role
      if (role_id === 2) {
        to_role = DEPT_ESCALATION_TARGET[dept_id]
        if (!to_role) {
          return res.status(400).json({ error: "Your department does not support escalation" })
        }
      } else {
        to_role = ESCALATION_TARGETS[role_id]
        if (!to_role) {
          return res.status(400).json({ error: "Escalation not supported for your role" })
        }
      }

      // Verify complaint exists
      const complaint = await pool.query(
        "SELECT * FROM complaints WHERE id = $1", [complaint_id]
      )
      if (complaint.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" })
      }

      // Check not already escalated at this level
      const existing = await pool.query(
        `SELECT id FROM complaint_escalations
         WHERE complaint_id = $1 AND from_role = $2`,
        [complaint_id, role_id]
      )
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Already escalated from your level" })
      }

      const escalation = await pool.query(
        `INSERT INTO complaint_escalations
           (complaint_id, escalated_by, from_role, to_role, reason, message)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [complaint_id, user_id, role_id, to_role, reason, message]
      )

      // Update complaint status to ESCALATED
      await pool.query(
        `UPDATE complaints SET status = 'ESCALATED', updated_at = NOW() WHERE id = $1`,
        [complaint_id]
      )

      res.json({
        message: "Escalated successfully",
        escalation: escalation.rows[0]
      })
    } catch (err) {
      console.error("Escalate Chain Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)


// ── 2. GET /complaints/:id/escalation-status ─────────────────
// Returns escalation chain status for a complaint (used by frontend cards)
app.get(
  "/complaints/:id/escalation-status",
  authenticateToken,
  authorizeRoles(2, 5, 6, 9, 10),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT from_role, to_role, reason, message, created_at
         FROM complaint_escalations
         WHERE complaint_id = $1
         ORDER BY created_at ASC`,
        [req.params.id]
      )
      res.json({ escalations: result.rows })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)


// ── 3. GET /hostel-manager/complaints ────────────────────────
// Hostel Manager sees all hostel complaints + escalated ones
// app.get(
//   "/hostel-manager/complaints",
//   authenticateToken,
//   authorizeRoles(6),
//   async (req, res) => {
//     try {
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
//           ce.id         AS chain_escalation_id,
//           ce.reason     AS chain_escalation_reason,
//           ce.message    AS chain_escalation_message,
//           ce.created_at AS chain_escalated_at,
//           escby.name    AS chain_escalated_by_name,
//           ce.from_role,
//           ce.to_role,
//           -- Check if already escalated to admin (to_role = 7)
//           EXISTS(SELECT 1 FROM complaint_escalations WHERE complaint_id = c.id AND to_role = 7) AS already_escalated_to_admin
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         LEFT JOIN complaint_escalations ce
//           ON ce.complaint_id = c.id AND ce.to_role = 6
//         LEFT JOIN users escby ON ce.escalated_by = escby.id
//         WHERE cc.routing_type = 'HOSTEL'
//           AND c.status IN ('OPEN', 'IN_PROGRESS', 'ESCALATED')
//         ORDER BY
//           CASE WHEN ce.id IS NOT NULL THEN 0 ELSE 1 END,
//           c.created_at DESC
//       `)
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Hostel Manager Complaints Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )

// Get resolved complaints for Hostel Manager
app.get(
  "/hostel-manager/resolved-complaints",
  authenticateToken,
  authorizeRoles(6),
  async (req, res) => {
    try {
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        WHERE cc.routing_type = 'HOSTEL'
          AND c.status = 'RESOLVED'
        ORDER BY c.updated_at DESC
      `)
      res.json({ complaints: complaints.rows })
    } catch (err) {
      console.error("Hostel Manager Resolved Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)




app.get(
  "/hostel-manager/escalated-complaints",
  authenticateToken,
  authorizeRoles(6),
  async (req, res) => {
    try {
      const manager_id = req.user.id
      
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          ce.reason AS escalation_reason,
          ce.message AS escalation_message,
          ce.created_at AS escalated_at,
          escby.name AS escalated_by_name,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
          -- Mark as already escalated to admin since these are complaints escalated TO admin
          TRUE AS already_escalated_to_admin
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        LEFT JOIN complaint_escalations ce ON ce.complaint_id = c.id AND ce.to_role = 7
        LEFT JOIN users escby ON ce.escalated_by = escby.id
        WHERE cc.routing_type = 'HOSTEL'
          AND c.status = 'ESCALATED'
          AND ce.escalated_by = $1
          AND ce.from_role = 6
        ORDER BY ce.created_at DESC
      `, [manager_id])
      
      res.json({ complaints: complaints.rows })
    } catch (err) {
      console.error("Hostel Manager Escalated Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)




// ── 3. GET /hostel-manager/complaints ────────────────────────
app.get(
  "/hostel-manager/complaints",
  authenticateToken,
  authorizeRoles(6),
  async (req, res) => {
    try {
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
          ce.id         AS chain_escalation_id,
          ce.reason     AS chain_escalation_reason,
          ce.message    AS chain_escalation_message,
          ce.created_at AS chain_escalated_at,
          escby.name    AS chain_escalated_by_name,
          ce.from_role,
          ce.to_role,
          -- Check if THIS complaint has been escalated to admin (to_role = 7)
          EXISTS(SELECT 1 FROM complaint_escalations WHERE complaint_id = c.id AND to_role = 7 AND from_role = 6) AS already_escalated_to_admin
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        LEFT JOIN complaint_escalations ce
          ON ce.complaint_id = c.id AND ce.to_role = 6
        LEFT JOIN users escby ON ce.escalated_by = escby.id
        WHERE cc.routing_type = 'HOSTEL'
        ORDER BY
          CASE WHEN ce.id IS NOT NULL THEN 0 ELSE 1 END,
          c.created_at DESC
      `)
      res.json({ complaints: complaints.rows })
    } catch (err) {
      console.error("Hostel Manager Complaints Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)


 
 
// ── 4. GET /librarian/complaints ─────────────────────────────

app.get(
  "/librarian/complaints",
  authenticateToken,
  authorizeRoles(9),
  async (req, res) => {
    try {
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
          ce_in.id           AS chain_escalation_id,
          ce_in.reason       AS chain_escalation_reason,
          ce_in.message      AS chain_escalation_message,
          ce_in.created_at   AS chain_escalated_at,
          escby.name         AS chain_escalated_by_name,
          ce_out.id IS NOT NULL AS escalated_to_admin,
          assigned.name      AS assigned_to_name,
          student.name       AS student_name
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users student ON c.student_id = student.id
        LEFT JOIN users assigned ON c.assigned_to = assigned.id
        LEFT JOIN complaint_escalations ce_in
          ON ce_in.complaint_id = c.id AND ce_in.to_role = 9
        LEFT JOIN users escby ON ce_in.escalated_by = escby.id
        LEFT JOIN complaint_escalations ce_out
          ON ce_out.complaint_id = c.id AND ce_out.from_role = 9
        WHERE cc.routing_type = 'FIXED_DEPARTMENT'
          AND cc.routed_department_id = 5
        ORDER BY
          CASE WHEN ce_in.id IS NOT NULL AND c.status != 'RESOLVED' THEN 0 ELSE 1 END,
          c.created_at DESC
      `)
      res.json({ complaints: complaints.rows })
    } catch (err) {
      console.error("Librarian Complaints Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)

// app.get(
//   "/librarian/complaints",
//   authenticateToken,
//   authorizeRoles(9),
//   async (req, res) => {
//     try {
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           ce.id         AS chain_escalation_id,
//           ce.reason     AS chain_escalation_reason,
//           ce.message    AS chain_escalation_message,
//           ce.created_at AS chain_escalated_at,
//           escby.name    AS chain_escalated_by_name
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         LEFT JOIN complaint_escalations ce
//           ON ce.complaint_id = c.id AND ce.to_role = 9
//         LEFT JOIN users escby ON ce.escalated_by = escby.id
//         WHERE cc.routing_type = 'FIXED_DEPARTMENT'
//           AND cc.routed_department_id = 5
//         ORDER BY
//           CASE WHEN ce.id IS NOT NULL THEN 0 ELSE 1 END,
//           c.created_at DESC
//       `)
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Librarian Complaints Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )
 
 
app.get(
  "/transport-manager/complaints",
  authenticateToken,
  authorizeRoles(10),
  async (req, res) => {
    try {
      const mgr_id = req.user.id
 
      const complaints = await pool.query(`
        SELECT
          c.*,
          cc.name AS category,
          (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
          ce_in.id           AS chain_escalation_id,
          ce_in.reason       AS chain_escalation_reason,
          ce_in.message      AS chain_escalation_message,
          ce_in.created_at   AS chain_escalated_at,
          escby.name         AS chain_escalated_by_name,
          ce_out.id IS NOT NULL AS escalated_to_admin,
          assigned.name      AS assigned_to_name,
          student.name       AS student_name
        FROM complaints c
        JOIN complaint_categories cc ON c.category_id = cc.id
        JOIN users student ON c.student_id = student.id
        LEFT JOIN users assigned ON c.assigned_to = assigned.id
        LEFT JOIN complaint_escalations ce_in
          ON ce_in.complaint_id = c.id AND ce_in.to_role = 10
        LEFT JOIN users escby ON ce_in.escalated_by = escby.id
        LEFT JOIN complaint_escalations ce_out
          ON ce_out.complaint_id = c.id AND ce_out.from_role = 10
        WHERE cc.routing_type = 'FIXED_DEPARTMENT'
          AND cc.routed_department_id = 6
        ORDER BY
          CASE WHEN ce_in.id IS NOT NULL AND c.status != 'RESOLVED' THEN 0 ELSE 1 END,
          c.created_at DESC
      `)
      res.json({ complaints: complaints.rows })
    } catch (err) {
      console.error("Transport Manager Complaints Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)


// // ── 5. GET /transport-manager/complaints ─────────────────────
// app.get(
//   "/transport-manager/complaints",
//   authenticateToken,
//   authorizeRoles(10),
//   async (req, res) => {
//     try {
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           ce.id         AS chain_escalation_id,
//           ce.reason     AS chain_escalation_reason,
//           ce.message    AS chain_escalation_message,
//           ce.created_at AS chain_escalated_at,
//           escby.name    AS chain_escalated_by_name
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         LEFT JOIN complaint_escalations ce
//           ON ce.complaint_id = c.id AND ce.to_role = 10
//         LEFT JOIN users escby ON ce.escalated_by = escby.id
//         WHERE cc.routing_type = 'FIXED_DEPARTMENT'
//           AND cc.routed_department_id = 6
//         ORDER BY
//           CASE WHEN ce.id IS NOT NULL THEN 0 ELSE 1 END,
//           c.created_at DESC
//       `)
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Transport Manager Complaints Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )


// app.get(
//   "/transport-manager/escalated-complaints",
//   authenticateToken,
//   authorizeRoles(10),
//   async (req, res) => {
//     try {
//       const manager_id = req.user.id
      
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           ce.reason AS escalation_reason,
//           ce.message AS escalation_message,
//           ce.created_at AS escalated_at,
//           escby.name AS escalated_by_name,
//           (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
//           TRUE AS already_escalated_to_admin
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         LEFT JOIN complaint_escalations ce ON ce.complaint_id = c.id AND ce.to_role = 7
//         LEFT JOIN users escby ON ce.escalated_by = escby.id
//         WHERE cc.routing_type = 'FIXED_DEPARTMENT'
//           AND cc.routed_department_id = 6
//           AND c.status = 'ESCALATED'
//           AND ce.escalated_by = $1
//           AND ce.from_role = 10
//         ORDER BY ce.created_at DESC
//       `, [manager_id])
      
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Transport Manager Escalated Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )



// ── GET /transport-manager/resolved-complaints ────────────────
// app.get(
//   "/transport-manager/resolved-complaints",
//   authenticateToken,
//   authorizeRoles(10),
//   async (req, res) => {
//     try {
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         WHERE cc.routing_type = 'FIXED_DEPARTMENT'
//           AND cc.routed_department_id = 6
//           AND c.status = 'RESOLVED'
//         ORDER BY c.updated_at DESC
//       `)
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Transport Manager Resolved Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )

// app.get(
//   "/transport-manager/complaints",
//   authenticateToken,
//   authorizeRoles(10),
//   async (req, res) => {
//     try {
//       const complaints = await pool.query(`
//         SELECT
//           c.*,
//           cc.name AS category,
//           (c.upvote_count * 2) + (cc.severity * 10) + (EXTRACT(DAY FROM NOW() - c.created_at)::int * 1) AS priority_score,
//           ce.id         AS chain_escalation_id,
//           ce.reason     AS chain_escalation_reason,
//           ce.message    AS chain_escalation_message,
//           ce.created_at AS chain_escalated_at,
//           escby.name    AS chain_escalated_by_name,
//           ce.from_role,
//           ce.to_role,
//           EXISTS(SELECT 1 FROM complaint_escalations WHERE complaint_id = c.id AND to_role = 7 AND from_role = 10) AS already_escalated_to_admin
//         FROM complaints c
//         JOIN complaint_categories cc ON c.category_id = cc.id
//         LEFT JOIN complaint_escalations ce
//           ON ce.complaint_id = c.id AND ce.to_role = 10
//         LEFT JOIN users escby ON ce.escalated_by = escby.id
//         WHERE cc.routing_type = 'FIXED_DEPARTMENT'
//           AND cc.routed_department_id = 6
//         ORDER BY
//           CASE WHEN ce.id IS NOT NULL THEN 0 ELSE 1 END,
//           c.created_at DESC
//       `)
//       res.json({ complaints: complaints.rows })
//     } catch (err) {
//       console.error("Transport Manager Complaints Error:", err)
//       res.status(500).json({ error: err.message })
//     }
//   }
// )



// ── 8. GET /admin/chain-escalations ──────────────────────────
// Admin sees all escalations sent TO admin (to_role = 7)
app.get("/admin/chain-escalations", authenticateToken, authorizeRoles(7), async (req, res) => {
  try {
    const escalations = await pool.query(`
      SELECT
        ce.*,
        c.title        AS complaint_title,
        c.description  AS complaint_description,
        c.status       AS complaint_status,
        c.upvote_count,
        c.created_at   AS complaint_created_at,
        cc.name        AS category,
        u.name         AS escalated_by_name,
        r.name         AS escalated_by_role,
        d.name         AS department,
        assigned.name  AS assigned_to_name,
        student.name   AS student_name
      FROM complaint_escalations ce
      JOIN complaints c            ON ce.complaint_id = c.id
      JOIN complaint_categories cc ON c.category_id = cc.id
      JOIN users u                 ON ce.escalated_by = u.id
      JOIN roles r                 ON ce.from_role = r.id
      LEFT JOIN departments d      ON u.department_id = d.id
      LEFT JOIN users assigned     ON c.assigned_to = assigned.id
      LEFT JOIN users student      ON c.student_id = student.id
      WHERE ce.to_role = 7
      ORDER BY ce.created_at DESC
    `)
    res.json({ escalations: escalations.rows })
  } catch (err) {
    console.error("Admin Chain Escalations Error:", err)
    res.status(500).json({ error: err.message })
  }
})


// ── 9. PUT /admin/chain-escalations/:complaint_id/resolve ────
// Admin resolves a complaint from the chain escalations view
app.put(
  "/admin/chain-escalations/:complaint_id/resolve",
  authenticateToken,
  authorizeRoles(7),
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE complaints SET status = 'RESOLVED', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [req.params.complaint_id]
      )
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Complaint not found" })
      res.json({ complaint: result.rows[0] })
    } catch (err) {
      console.error("Admin Chain Resolve Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)


// ── 10. PUT /chain-escalations/:id/read ──────────────────────
app.put(
  "/chain-escalations/:id/read",
  authenticateToken,
  authorizeRoles(6, 7, 9, 10),
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE complaint_escalations SET is_read = TRUE WHERE id = $1",
        [req.params.id]
      )
      res.json({ message: "Marked as read" })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)


// ── 11. GET /my-escalations ───────────────────────────────────
// Any manager sees complaints they escalated upward
app.get(
  "/my-escalations",
  authenticateToken,
  authorizeRoles(5, 6, 9, 10),
  async (req, res) => {
    try {
      const user_id = req.user.id
      const role_id = req.user.role_id

      const escalations = await pool.query(`
        SELECT
          ce.*,
          c.title       AS complaint_title,
          c.status      AS complaint_status,
          c.description AS complaint_description,
          cc.name       AS category
        FROM complaint_escalations ce
        JOIN complaints c ON ce.complaint_id = c.id
        JOIN complaint_categories cc ON c.category_id = cc.id
        WHERE ce.escalated_by = $1
          AND ce.from_role = $2
        ORDER BY ce.created_at DESC
      `, [user_id, role_id])

      res.json({ escalations: escalations.rows })
    } catch (err) {
      console.error("My Escalations Error:", err)
      res.status(500).json({ error: err.message })
    }
  }
)

app.get("/", (req, res) => {
  res.send("Complaint backend is running");
});

app.listen(5001, () => {
    console.log(`Server running on port 5000`);
});
