function doPost(e) {
  try {
    console.log("1. doPost execution started.");
    
    // 1. Get the active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Extract parameters from the incoming POST request
    var name = e.parameter.name || "Unknown";
    var email = (e.parameter.email || "").trim();
    var subject = e.parameter.subject || "No Subject";
    var message = e.parameter.message || "No Message";
    var timestamp = new Date();
    
    console.log("Received Email: " + email);
    
    // Basic server-side validation to prevent empty spam
    if (!name || !email || !message) {
      console.log("Error: Missing required fields.");
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": "Missing required fields."}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Append to Google Sheets
    try {
      sheet.appendRow([timestamp, name, email, subject, message]);
      console.log("2. Sheet append successful.");
    } catch (sheetError) {
      console.error("Sheet append failed: " + sheetError);
    }
    
    // Validate Email using simple Regex
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var isEmailValid = emailRegex.test(email);
    
    // 4. Send Auto-Reply to Visitor
    if (isEmailValid) {
      try {
        var visitorSubject = "Thanks for contacting Manish Pandey — HMPManish";
        var visitorBody = "Hi " + name + ",\n\n" +
                          "Thanks for contacting me through my portfolio.\n\n" +
                          "I received your message successfully and will get back to you as soon as possible.\n\n" +
                          "Your message:\n\n" + message + "\n\n" +
                          "Best regards,\n" +
                          "Manish Pandey\n" +
                          "HMPManish\n\n" +
                          "GitHub: https://github.com/hmpmanish\n" +
                          "Portfolio: https://hmpmanish.github.io/info/";
                          
        MailApp.sendEmail({
          to: email,
          subject: visitorSubject,
          body: visitorBody,
          name: "HMPManish"
        });
        console.log("3. Visitor auto-reply sent successfully.");
      } catch (visitorMailError) {
        console.error("Failed to send visitor email: " + visitorMailError);
      }
    } else {
      console.log("Visitor email format is invalid. Auto-reply skipped.");
    }
    
    // 5. Send Notification to Owner
    try {
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
      console.log("4. Owner notification sent successfully.");
    } catch (ownerMailError) {
      console.error("Failed to send owner email: " + ownerMailError);
    }
    
    // 6. Return Success
    console.log("5. Execution completed successfully.");
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (globalError) {
    console.error("Global Error: " + globalError.toString());
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": globalError.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
