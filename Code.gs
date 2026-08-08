function doPost(e) {
  try {
    // 1. Get the active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Extract parameters from the incoming POST request
    var name = e.parameter.name || "Unknown";
    var email = e.parameter.email || "No Email";
    var subject = e.parameter.subject || "No Subject";
    var message = e.parameter.message || "No Message";
    var timestamp = new Date();
    
    // Basic server-side validation to prevent empty spam
    if (!e.parameter.name || !e.parameter.email || !e.parameter.message) {
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Missing required fields."}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Append to Google Sheets
    sheet.appendRow([timestamp, name, email, subject, message]);
    
    // 4. Send Auto-Reply to Visitor
    var visitorSubject = "Thanks for contacting Manish Pandey — HMPManish";
    var visitorBody = "Hi " + name + ",\n\n" +
                      "Thanks for reaching out to me through my portfolio.\n\n" +
                      "I’ve received your message successfully and will get back to you as soon as possible.\n\n" +
                      "Your message:\n\n\"" + message + "\"\n\n" +
                      "Best regards,\n" +
                      "Manish Pandey\n" +
                      "HMPManish\n\n" +
                      "GitHub: https://github.com/hmpmanish\n" +
                      "Portfolio: https://hmpmanish.github.io/info/";
                      
    MailApp.sendEmail({
      to: email,
      subject: visitorSubject,
      body: visitorBody,
      name: "Manish Pandey"
    });
    
    // 5. Send Notification to Owner
    var ownerEmail = "hmpmanish.dev@gmail.com";
    var ownerSubject = "New Portfolio Contact — " + name;
    var ownerBody = "You have received a new message from your portfolio.\n\n" +
                    "Name: " + name + "\n" +
                    "Email: " + email + "\n" +
                    "Subject: " + subject + "\n" +
                    "Time: " + timestamp + "\n\n" +
                    "Message:\n" + message;
                    
    MailApp.sendEmail({
      to: ownerEmail,
      subject: ownerSubject,
      body: ownerBody
    });
    
    // 6. Return Success
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
