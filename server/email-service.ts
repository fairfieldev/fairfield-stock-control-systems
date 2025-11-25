import nodemailer from "nodemailer";
import type { Transfer } from "@shared/schema";
import { storage } from "./storage";

interface EmailData {
  transfer: Partial<Transfer>;
  fromLocation: string;
  toLocation: string;
  recipientEmail: string;
  isTest?: boolean;
}

async function getEmailTransporter() {
  const settings = await storage.getEmailSettings();
  
  if (!settings) {
    console.log("No email settings configured. Emails will be logged to console only.");
    return null;
  }

  // Create transporter based on provider
  if (settings.provider === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword,
      },
    });
  } else if (settings.provider === "smtp") {
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword,
      },
    });
  } else if (settings.provider === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: settings.apiKey,
      },
    });
  } else if (settings.provider === "resend") {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      auth: {
        user: "resend",
        pass: settings.apiKey,
      },
    });
  }

  return null;
}

export async function sendOrderFulfillmentEmail(data: EmailData): Promise<void> {
  const { transfer, fromLocation, toLocation, recipientEmail, isTest } = data;

  const subject = isTest
    ? "Test Email - Fairfield Stock Control System"
    : `Transfer #${transfer.id} Received`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f3f4f6; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-received { background-color: #D1FAE5; color: #065F46; }
    .alert { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isTest ? "🧪 Test Email" : "📦 Transfer Received"}</h1>
      <p>Fairfield Stock Control System</p>
    </div>
    
    <div class="content">
      ${
        isTest
          ? `
      <div class="alert">
        <strong>⚠️ This is a test email</strong><br>
        Your email integration is working correctly! You will receive similar notifications when transfers are marked as received.
      </div>
      `
          : ""
      }
      
      <div class="section">
        <h2>Transfer Details</h2>
        <p><span class="label">Transfer ID:</span> <span class="value">${transfer.id}</span></p>
        <p><span class="label">Status:</span> <span class="status-badge status-received">RECEIVED</span></p>
        <p><span class="label">From:</span> <span class="value">${fromLocation}</span></p>
        <p><span class="label">To:</span> <span class="value">${toLocation}</span></p>
        <p><span class="label">Driver:</span> <span class="value">${transfer.driverName}</span></p>
        <p><span class="label">Vehicle:</span> <span class="value">${transfer.vehicleReg}</span></p>
        ${
          transfer.receivedAt
            ? `<p><span class="label">Received At:</span> <span class="value">${new Date(transfer.receivedAt).toLocaleString()}</span></p>`
            : ""
        }
      </div>

      <div class="section">
        <h3>Products Transferred</h3>
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.items
              ?.map(
                (item) => `
              <tr>
                <td>${item.productCode}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      ${
        transfer.shortages && transfer.shortages.length > 0
          ? `
      <div class="section">
        <h3 style="color: #F59E0B;">⚠️ Shortages Reported</h3>
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Quantity Short</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.shortages
              .map(
                (shortage: any) => `
              <tr>
                <td>${shortage.productCode}</td>
                <td>${shortage.productName}</td>
                <td style="color: #F59E0B; font-weight: 600;">${shortage.quantityShort}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      `
          : ""
      }

      ${
        transfer.damages && transfer.damages.length > 0
          ? `
      <div class="section">
        <h3 style="color: #DC2626;">🔴 Damages Reported</h3>
        <table>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Quantity Damaged</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.damages
              .map(
                (damage: any) => `
              <tr>
                <td>${damage.productCode}</td>
                <td>${damage.productName}</td>
                <td style="color: #DC2626; font-weight: 600;">${damage.quantityDamaged}</td>
                <td>${damage.reason || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      `
          : ""
      }

      ${
        (!transfer.shortages || transfer.shortages.length === 0) &&
        (!transfer.damages || transfer.damages.length === 0) &&
        !isTest
          ? `
      <div class="section" style="background-color: #D1FAE5; padding: 12px; border-radius: 4px;">
        <p style="color: #065F46; margin: 0;">
          ✅ <strong>All products received in full with no damages</strong>
        </p>
      </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      <p>This is an automated notification from Fairfield Stock Control System</p>
      <p>Do not reply to this email</p>
    </div>
  </div>
</body>
</html>
  `;

  // Get email transporter
  const transporter = await getEmailTransporter();
  
  if (!transporter) {
    // No email configuration - just log to console
    console.log("===== EMAIL NOTIFICATION (NOT SENT - NO CONFIG) =====");
    console.log("To:", recipientEmail);
    console.log("Subject:", subject);
    console.log("=================================================");
    return;
  }

  // Send actual email
  try {
    const settings = await storage.getEmailSettings();
    await transporter.sendMail({
      from: settings?.senderEmail || "noreply@fairfield.com",
      to: recipientEmail,
      subject: subject,
      html: htmlBody,
    });

    console.log(`✅ Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
