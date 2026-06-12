const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Shantabai Contact", email: process.env.EMAIL_TO },
        to: [{ email: process.env.EMAIL_TO }],
        replyTo: { email: email, name: name },
        subject: `[Contact] ${subject} — from ${name}`,
        textContent: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      return res.status(500).json({ success: false, message: "Failed to send message. Try again later." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact email error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to send message. Try again later." });
  }
});

module.exports = router;