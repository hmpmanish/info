// Configuration variables
const CONFIG = {
  MY_EMAIL: "hmpmanish.dev@gmail.com", // REPLACE WITH: Your email address to receive notifications
  MY_NAME: "HMP Manish",  // REPLACE WITH: Your name or your website's name
  WEBSITE_NAME: "HMP Manish",         // REPLACE WITH: Your website name
  SPREADSHEET_ID: "1Nsos-UUnvDoGIXYtEg-avPmWMAp7xW9svKgIHS9UxB4", // Master Google Sheet ID
  SHEET_NAME: "Form Responses",       // EXACT name of the sheet inside your Google Spreadsheet
  
  // ==========================================
  // FREE CHAT NOTIFICATIONS (Optional)
  // ==========================================
  
  // Telegram Bot Settings
  TELEGRAM_BOT_TOKEN: "8919319715:AAEvsf0xIhUMwua1oCuc6_ilUXj84imoYlI", // e.g. "123456789:ABCdefGHIjkl..."
  TELEGRAM_CHAT_ID: "7919817821",   // e.g. "12345678"
  
  // WhatsApp Settings via CallMeBot
  WHATSAPP_PHONE: "",     // Your phone number with country code, e.g. "+919876543210"
  WHATSAPP_API_KEY: "",    // Your CallMeBot API key

  // ==========================================
  // GEMINI AI SETTINGS
  // ==========================================
  GEMINI_API_KEY: "AQ.Ab8RN6JK2-pZ6gPlJp5qAT9il8JsZJhheEOrMXjZ20mB_dd7Qw", // REPLACE WITH: Your Gemini API Key from Google AI Studio
  
  // ==========================================
  // NEW ULTRA PREMIUM SETTINGS
  // ==========================================
  DISCORD_WEBHOOK_URL: "", // REPLACE WITH: Your Discord Webhook URL for notifications
  DRIVE_FOLDER_ID: ""      // REPLACE WITH: Google Drive Folder ID to save attachments
};

function doPost(e) {
  // Return standard JSON responses (CORS is inherently handled by Apps Script for Web Apps)
  try {
    // Check if parameters exist
    if (!e || !e.parameter) {
      return createJsonResponse(false, "Invalid request. No data received.");
    }
    
    // 0. Secret Visitor Analytics Tracking
    if (e.parameter.action === 'track') {
      const eventType = "Page Visit";
      const ip = e.parameter.ip || "";
      const city = e.parameter.city || "";
      const region = e.parameter.region || "";
      const country = e.parameter.country || "";
      const isp = e.parameter.isp || "";
      const latlong = e.parameter.latlong || "";
      const os = e.parameter.os || "";
      const browser = e.parameter.browser || "";
      const screen = e.parameter.screen || "";
      const referrer = e.parameter.referrer || "";
      const timezone = e.parameter.timezone || "";
      const language = e.parameter.language || "";
      
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      // Automatically select the very first tab from the left, regardless of its name!
      let sheet = spreadsheet.getSheets()[0];
      
      // Auto-create headers ONLY if the sheet is completely empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Timestamp", "Event Type", "Name", "Email", "Phone", "Subject", "Message", "Auto Reply Status", "Chat Status", "IP Address", "City", "State / Region", "Country", "ISP", "Lat / Long", "OS", "Browser", "Screen Resolution", "Referrer", "Timezone", "Language"]);
        sheet.getRange(1, 1, 1, 21).setFontWeight("bold");
      }
      
      sheet.appendRow([new Date(), eventType, "", "", "", "", "", "", "", ip, city, region, country, isp, latlong, os, browser, screen, referrer, timezone, language]);
      return createJsonResponse(true, "Visit logged silently in main sheet.");
    }
    
    // NEW: Chat with AI Action
    if (e.parameter.action === 'chat') {
      const userMessage = e.parameter.message || "";
      if (userMessage.trim() === "") {
        return createJsonResponse(false, "Message is empty.");
      }
      
      if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        return createJsonResponse(true, "I'm currently undergoing maintenance (API Key not set). Please use the contact form to reach Manish directly!");
      }
      
      try {
        const aiResponse = callGeminiAPI(userMessage);
        return createJsonResponse(true, aiResponse);
      } catch (error) {
        console.error("Gemini API Error: " + error.toString());
        return createJsonResponse(false, "Sorry, my AI systems are momentarily down. Please try again later!");
      }
    }
    
    // Extract form fields with fallbacks for optional parameters
    const name = e.parameter.name || "";
    const email = e.parameter.email || "";
    const phone = e.parameter.phone || "Not provided";
    const subject = e.parameter.subject || "No subject";
    let message = e.parameter.message || "";
    
    // Process attachment if provided
    let attachmentLink = "";
    if (e.parameter.attachmentData && CONFIG.DRIVE_FOLDER_ID) {
      try {
        const decoded = Utilities.base64Decode(e.parameter.attachmentData);
        const blob = Utilities.newBlob(decoded, e.parameter.attachmentMime || 'application/octet-stream', e.parameter.attachmentName || 'attachment_file');
        const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
        const file = folder.createFile(blob);
        attachmentLink = file.getUrl();
        message += `\n\nAttachment: ${attachmentLink}`;
      } catch (err) {
        console.error("Failed to upload attachment: " + err);
        message += `\n\n[Attachment upload failed: ${err.message}]`;
      }
    }
    
    // 1. Validation
    if (name.trim() === "") {
      return createJsonResponse(false, "Name is required.");
    }
    if (!isValidEmail(email)) {
      return createJsonResponse(false, "Valid email is required.");
    }
    if (message.trim() === "") {
      return createJsonResponse(false, "Message is required.");
    }
    
    let autoReplyStatus = "Pending";
    let adminNotificationStatus = "Pending";
    
    // 2. Send Auto-Reply to Visitor
    try {
      sendAutoReply(name, email, phone, subject, message);
      autoReplyStatus = "Sent";
    } catch (error) {
      autoReplyStatus = "Failed: " + error.message;
    }
    
    // 3. Send Notification to Admin (You)
    try {
      sendAdminNotification(name, email, phone, subject, message);
      adminNotificationStatus = "Sent";
    } catch (error) {
      adminNotificationStatus = "Failed: " + error.message;
    }
    
    let chatNotificationStatus = "Skipped";
    // 3.5 Send Chat Notifications (Telegram / WhatsApp / Discord)
    try {
      let sentTo = [];
      if (CONFIG.DISCORD_WEBHOOK_URL) {
        sendDiscordNotification(name, email, phone, subject, message);
        sentTo.push("Discord");
      }
      if (CONFIG.TELEGRAM_BOT_TOKEN && CONFIG.TELEGRAM_CHAT_ID) {
        sendTelegramNotification(name, email, phone, subject, message);
        sentTo.push("Telegram");
      }
      if (CONFIG.WHATSAPP_PHONE && CONFIG.WHATSAPP_API_KEY) {
        sendWhatsAppNotification(name, email, phone, subject, message);
        sentTo.push("WhatsApp");
      }
      if (sentTo.length > 0) chatNotificationStatus = "Sent (" + sentTo.join(", ") + ")";
    } catch (error) {
      chatNotificationStatus = "Error: " + error.message;
      console.error("Chat Notification Error: " + error.message);
    }
    
    let sheetStatus = "Saved successfully";
    // 4. Save to Google Sheet
    try {
      saveToSheet(name, email, phone, subject, message, autoReplyStatus, chatNotificationStatus);
    } catch (error) {
      // Even if saving to the sheet fails, we continue because emails might have succeeded
      sheetStatus = "Failed: " + error.message;
      console.error("Sheet Error: " + error.message);
    }
    
    // 5. Final Response
    if (autoReplyStatus === "Sent" || adminNotificationStatus === "Sent") {
      return createJsonResponse(true, `Message Sent! [Sheet: ${sheetStatus}] [Chat: ${chatNotificationStatus}]`);
    } else {
      return createJsonResponse(false, `Error details -> Sheet: ${sheetStatus} | Auto-reply: ${autoReplyStatus} | Admin: ${adminNotificationStatus}`);
    }

  } catch (error) {
    return createJsonResponse(false, "System error: " + error.toString());
  }
}

// Handle GET requests (useful for verifying the Web App is live)
function doGet(e) {
  return HtmlService.createHtmlOutput("Contact Form Web App is running correctly. Please use POST to submit data.");
}

// Helper: Create JSON response
function createJsonResponse(success, message) {
  const response = {
    success: success,
    message: message
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Validate email format
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Helper: Send Auto-Reply to Visitor
function sendAutoReply(name, email, phone, subject, message) {
  const emailSubject = "Thank You for Contacting Us";
  
  // Plain text fallback
  const textBody = `Hello ${name},\n\nThank you for contacting us. We have successfully received your message.\n\nHere are the details you submitted:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\nMessage: ${message}\n\nOur team will review your request and get back to you as soon as possible.\n\nBest regards,\n${CONFIG.MY_NAME}\n${CONFIG.WEBSITE_NAME}`;

  // Beautiful HTML Email Template (Brand style)
  const htmlBody = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
    
    <!-- Header with Logo -->
    <div style="background-color: #070a13; padding: 35px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <!-- Hosted Logo from GitHub -->
      <img src="https://raw.githubusercontent.com/hmpmanish/info/main/WhatsApp%20Image%202026-09-14%20at%206.15.11%20PM.jpeg" alt="${CONFIG.WEBSITE_NAME} Logo" style="max-height: 80px; width: auto; margin-bottom: 15px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; display: none;">${CONFIG.WEBSITE_NAME}</h1>
    </div>
    
    <!-- Body -->
    <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; margin-bottom: 15px;">Hi ${name},</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Thank you for reaching out! We have successfully received your message. Our team is carefully reviewing your request and will get back to you as soon as possible.
      </p>
      
      <!-- Summary Box -->
      <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; border-left: 4px solid #4f46e5; margin-bottom: 30px;">
        <h3 style="color: #334155; font-size: 14px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Message Details</h3>
        <p style="color: #475569; margin: 8px 0; font-size: 15px;"><strong>Email:</strong> ${email}</p>
        <p style="color: #475569; margin: 8px 0; font-size: 15px;"><strong>Phone:</strong> ${phone}</p>
        <p style="color: #475569; margin: 8px 0; font-size: 15px;"><strong>Subject:</strong> ${subject}</p>
        <p style="color: #475569; margin: 15px 0 5px 0; font-size: 15px;"><strong>Message:</strong></p>
        <div style="color: #334155; font-size: 15px; background: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; white-space: pre-wrap; font-style: italic;">"${message}"</div>
      </div>
      
      <!-- Signature -->
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
        Best regards,<br>
        <strong style="color: #0f172a;">${CONFIG.MY_NAME}</strong><br>
        <span style="color: #64748b; font-size: 14px;">BUILD • CODE • INNOVATE</span>
      </p>
    </div>
    
    <!-- Footer with Social Media -->
    <div style="text-align: center; padding: 25px 20px 10px 20px;">
      
      <!-- Social Media Icons (Update the href links with your actual profile URLs) -->
      <div style="margin-bottom: 20px;">
        <a href="https://linkedin.com/in/hmpmanish" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 24px; height: 24px;">
        </a>
        <a href="https://github.com/hmpmanish" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" alt="GitHub" style="width: 24px; height: 24px;">
        </a>
        <a href="https://twitter.com/hmpmanish" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733590.png" alt="Twitter" style="width: 24px; height: 24px;">
        </a>
        <a href="https://instagram.com/hmpmanish" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" style="width: 24px; height: 24px;">
        </a>
        <a href="https://youtube.com/c/hmpmanish" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none;">
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" style="width: 24px; height: 24px;">
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
        This is an automated response. Please do not reply directly to this email.<br>
        &copy; ${new Date().getFullYear()} ${CONFIG.WEBSITE_NAME}. All rights reserved.
      </p>
    </div>
    
  </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: emailSubject,
    body: textBody,       // For older email clients that don't support HTML
    htmlBody: htmlBody,   // The beautiful HTML version
    name: CONFIG.WEBSITE_NAME
  });
}

// Helper: Send Notification to You
function sendAdminNotification(name, email, phone, subject, message) {
  const emailSubject = `New Contact Form Submission: ${subject}`;
  
  const emailBody = `You have received a new contact form submission.

Details:
Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}
Message: ${message}

(You can reply directly to this email to reach the visitor.)`;

  MailApp.sendEmail({
    to: CONFIG.MY_EMAIL,
    subject: emailSubject,
    body: emailBody,
    replyTo: email, // This allows you to hit "Reply" and email the visitor directly
    name: `${name} (via Website)`
  });
}

// Helper: Save details to Google Sheet
function saveToSheet(name, email, phone, subject, message, autoReplyStatus, chatNotificationStatus) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  // Automatically select the very first tab from the left, regardless of its name!
  let sheet = spreadsheet.getSheets()[0];
  
  // Auto-create 21 headers ONLY if the sheet is completely empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Event Type", "Name", "Email", "Phone", "Subject", "Message", "Auto Reply Status", "Chat Status", "IP Address", "City", "State / Region", "Country", "ISP", "Lat / Long", "OS", "Browser", "Screen Resolution", "Referrer", "Timezone", "Language"]);
    sheet.getRange(1, 1, 1, 21).setFontWeight("bold");
  }
  
  const timestamp = new Date();
  
  // Columns matching requirement (21 columns)
  sheet.appendRow([timestamp, "Form Submit", name, email, phone, subject, message, autoReplyStatus, chatNotificationStatus || "Unknown", "", "", "", "", "", "", "", "", "", "", "", ""]);
}

// ==========================================
// CHAT NOTIFICATION HELPERS
// ==========================================

// Helper: Send Telegram Notification
function sendTelegramNotification(name, email, phone, subject, message) {
  const text = `🚨 <b>New Contact Form Submission</b>\n\n<b>Name:</b> ${name}\n<b>Email:</b> ${email}\n<b>Phone:</b> ${phone}\n<b>Subject:</b> ${subject}\n\n<b>Message:</b>\n${message}`;
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = { chat_id: CONFIG.TELEGRAM_CHAT_ID, text: text, parse_mode: "HTML" };
  const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload) };
  UrlFetchApp.fetch(url, options);
}

// Helper: Send WhatsApp Notification via CallMeBot
function sendWhatsAppNotification(name, email, phone, subject, message) {
  const text = `🚨 *New Contact Form Submission*\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
  const encodedText = encodeURIComponent(text);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${CONFIG.WHATSAPP_PHONE}&text=${encodedText}&apikey=${CONFIG.WHATSAPP_API_KEY}`;
  UrlFetchApp.fetch(url);
}

// Helper: Send Discord Notification
function sendDiscordNotification(name, email, phone, subject, message) {
  const payload = {
    embeds: [{
      title: "🚨 New Contact Form Submission",
      color: 3447003,
      fields: [
        { name: "Name", value: name || "N/A", inline: true },
        { name: "Email", value: email || "N/A", inline: true },
        { name: "Phone", value: phone || "N/A", inline: true },
        { name: "Subject", value: subject || "N/A" },
        { name: "Message", value: message.substring(0, 1024) || "N/A" }
      ],
      timestamp: new Date().toISOString()
    }]
  };
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, options);
}

// ==========================================
// RUN THIS ONCE TO GRANT PERMISSIONS
// ==========================================
function authorizeExternalAPI() {
  UrlFetchApp.fetch("https://api.telegram.org/");
}

// ==========================================
// GEMINI AI INTEGRATION
// ==========================================
function callGeminiAPI(userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
  
  const systemPrompt = `You are the personal AI assistant for Manish Pandey (also known as HMPManish). 
Manish is a highly skilled Software Engineer and AI Enthusiast based in Gonda, Uttar Pradesh, India.
He specializes in Full Stack Web Development (React, Node.js), AI/ML, and SaaS products.
Some of his top projects include:
- Bharat MSME AI Manager
- Sharda Connect
- Fake Login Detector
- Krishi Sewa
- Motion Tracking System

Keep your answers concise, professional, friendly, and helpful. Use some emojis where appropriate. 
If someone asks to hire him, tell them to use the contact form below or email hmpmanish.dev@gmail.com.
If someone asks something completely unrelated to Manish, technology, or web development, politely redirect the conversation back to Manish's skills and projects.`;

  const tools = [{
    "functionDeclarations": [
      {
        "name": "getManishContactDetails",
        "description": "Returns the best way to contact Manish Pandey, including email and social media links."
      },
      {
        "name": "getResumeLink",
        "description": "Returns the URL to view or download Manish Pandey's professional resume."
      }
    ]
  }];

  const payload = {
    "system_instruction": {
      "parts": [ { "text": systemPrompt } ]
    },
    "contents": [
      {
        "parts": [
          { "text": userMessage }
        ]
      }
    ],
    "tools": tools
  };
  
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();
  
  if (responseCode === 200) {
    const json = JSON.parse(responseBody);
    if (json.candidates && json.candidates.length > 0) {
      const part = json.candidates[0].content.parts[0];
      if (part.functionCall) {
        const fnName = part.functionCall.name;
        if (fnName === "getManishContactDetails") {
          return "You can contact me directly at hmpmanish.dev@gmail.com, or use the contact form on this website. You can also connect with me on LinkedIn at https://linkedin.com/in/hmpmanish.";
        } else if (fnName === "getResumeLink") {
          return "You can view and download my resume here: https://hmpmanish.github.io/info/resume.html";
        }
      }
      return part.text;
    } else {
      throw new Error("No candidates found in Gemini response.");
    }
  } else {
    throw new Error(`Gemini API returned ${responseCode}: ${responseBody}`);
  }
}

// ==========================================
// SCHEDULED TRIGGER FUNCTIONS
// ==========================================

// Task 3: Send Daily Analytics Summary
function sendDailySummary() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return; // Only headers
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let visitorsToday = 0;
  let messagesToday = 0;
  
  // Headers are at index 0
  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][0]);
    if (rowDate >= today) {
      const eventType = data[i][1];
      if (eventType === "Page Visit") {
        visitorsToday++;
      } else if (eventType === "Form Submit") {
        messagesToday++;
      }
    }
  }
  
  const subject = `Daily Analytics Summary - ${CONFIG.WEBSITE_NAME}`;
  const body = `Hello Admin,\n\nHere is your summary for today:\n\nUnique Visitors Today: ${visitorsToday}\nNew Messages Received: ${messagesToday}\n\nKeep up the great work!`;
  
  MailApp.sendEmail({
    to: CONFIG.MY_EMAIL,
    subject: subject,
    body: body
  });
}

// Task 5: Automated Follow-up System
function processFollowUps() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return;
  
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
  
  let headerRow = data[0];
  let followUpColIdx = headerRow.indexOf("Follow-Up Status");
  
  if (followUpColIdx === -1) {
    followUpColIdx = headerRow.length;
    sheet.getRange(1, followUpColIdx + 1).setValue("Follow-Up Status");
    sheet.getRange(1, followUpColIdx + 1).setFontWeight("bold");
  }
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] === "Form Submit") {
      const submitDate = new Date(row[0]);
      const followUpStatus = row[followUpColIdx];
      
      if (submitDate < twoDaysAgo && (!followUpStatus || followUpStatus === "")) {
        const name = row[2];
        const email = row[3];
        
        const subject = "Following up on your inquiry";
        const body = `Hi ${name},\n\nI wanted to personally follow up on your recent message. I am currently reviewing your request and will get back to you shortly with more details.\n\nBest regards,\n${CONFIG.MY_NAME}`;
        
        try {
          MailApp.sendEmail({
            to: email,
            subject: subject,
            body: body,
            name: CONFIG.MY_NAME
          });
          sheet.getRange(i + 1, followUpColIdx + 1).setValue("Followed-up");
        } catch (e) {
          sheet.getRange(i + 1, followUpColIdx + 1).setValue("Follow-up Failed");
        }
      }
    }
  }
}
