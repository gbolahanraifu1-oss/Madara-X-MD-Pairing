import { Router, type IRouter } from "express";
import { db, contactMessagesTable } from "../lib/db";

const router: IRouter = Router();

// POST /contact
router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (name.length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters" });
    return;
  }

  if (subject.length < 3) {
    res.status(400).json({ error: "Subject must be at least 3 characters" });
    return;
  }

  if (message.length < 10) {
    res.status(400).json({ error: "Message must be at least 10 characters" });
    return;
  }

  await db.insert(contactMessagesTable).values({
    name,
    email: email.toLowerCase(),
    subject,
    message,
  });

  req.log.info({ email }, "Contact message submitted");

  res.json({ message: "Your message has been received. We will get back to you soon!" });
});

export default router;
