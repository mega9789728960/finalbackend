import pool from "../../../database/database.js"; 
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree SDK
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CLIENT_ID || "TEST108360771478c4665f846cfe949877063801",
  process.env.CLIENT_SECRET || "cfsk_ma_test_b560921740a233497ed2b83bf3ce4599_113f10f2"
);

export default async function paymentWebhook(req, res) {
  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = req.rawBody;

    // Verify authenticity
    const isValid = cashfree.PGVerifyWebhookSignature(
      signature,
      rawBody,
      timestamp
    );

    if (!isValid) {
      console.log("❌ Invalid webhook signature");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    console.log("✅ Webhook verified successfully!");
    console.log("Webhook data:", req.body);

    // Extract data
    const body = req.body;
    const data = body.data;

    const orderId = data.order.order_id;
    const orderAmount = data.order.order_amount;
    const orderCurrency = data.order.order_currency;

    const cfPaymentId = data.payment.cf_payment_id;
    const paymentStatus = data.payment.payment_status;
    const paymentAmount = data.payment.payment_amount;
    const paymentTime = data.payment.payment_time;
    const bankReference = data.payment.bank_reference;
    const paymentMethod = data.payment.payment_method;

    const customerId = data.customer_details.customer_id;
    const customerName = data.customer_details.customer_name;
    const customerEmail = data.customer_details.customer_email;
    const customerPhone = data.customer_details.customer_phone;

    const gatewayName = data.payment_gateway_details.gateway_name;
    const gatewayPaymentId = data.payment_gateway_details.gateway_payment_id;
    const gatewayOrderId = data.payment_gateway_details.gateway_order_id;
    const gatewaySettlement = data.payment_gateway_details.gateway_settlement;

    // ---------------------------------------------------------
    // 🛡️ Prevent duplicate payment entry
    // ---------------------------------------------------------
    const existing = await pool.query(
      "SELECT id FROM payments WHERE cf_payment_id = $1",
      [cfPaymentId]
    );

    if (existing.rows.length > 0) {
      console.log("⚠️ Duplicate webhook ignored for:", cfPaymentId);
      return res.status(200).json({ success: true, duplicate: true });
    }

    // ---------------------------------------------------------
    // Insert into payments table
    // ---------------------------------------------------------
    await pool.query(
      `INSERT INTO payments (
        order_id,
        order_amount,
        order_currency,
        cf_payment_id,
        payment_status,
        payment_amount,
        payment_time,
        bank_reference,
        payment_method,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        gateway_name,
        gateway_payment_id,
        gateway_order_id,
        gateway_settlement,
        raw_webhook
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18
      )`,
      [
        orderId,
        orderAmount,
        orderCurrency,
        cfPaymentId,
        paymentStatus,
        paymentAmount,
        paymentTime,
        bankReference,
        paymentMethod,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        gatewayName,
        gatewayPaymentId,
        gatewayOrderId,
        gatewaySettlement,
        body
      ]
    );

    console.log("✅ Payment recorded in payments table");

    // ---------------------------------------------------------
    // Update mess bill table
    // ---------------------------------------------------------
    if (paymentStatus === "SUCCESS") {
      await pool.query(
        `UPDATE mess_bill_for_students 
         SET status = $1, updated_at = NOW(), paid_date = NOW()
         WHERE latest_order_id = $2`,
        [paymentStatus, gatewayOrderId]
      );
    } else {
      await pool.query(
        `UPDATE mess_bill_for_students 
         SET status = $1, updated_at = NOW()
         WHERE latest_order_id = $2`,
        [paymentStatus, gatewayOrderId]
      );
    }

    console.log(`✅ Updated mess bill (${orderId}) to status: ${paymentStatus}`);

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
