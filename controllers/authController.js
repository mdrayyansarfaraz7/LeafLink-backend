import User from "../models/User.js";
import Nursery from "../models/Nursery.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import crypto from "crypto";
import paigam from "paigam";

export const registerManager = async (req, res) => {
  const { fullName, email, password, nurseryName, address, contactNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create manager user (nursery will be attached after nursery creation)
    const manager = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "manager",
      isActive: true,
    });

    const nursery = await Nursery.create({
      name: nurseryName,
      address,
      contactNumber,
      manager: manager._id,
    });

    // Link manager -> nursery
    manager.nursery = nursery._id;
    await manager.save();

    // Sign token
    const token = jwt.sign(
      { id: manager._id, role: manager.role, nursery: nursery._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    const Welcomehtml = paigam.welcomeEmail({
      color: "#04b533",
      username: fullName,
      companyName: "LeafLink",
      ctaLink: "https://leaflink.com/login",
      ctaText: "Login to your account",
      logoUrl: "https://res.cloudinary.com/ddo15zw7d/image/upload/v1761155671/WhatsApp_Image_2025-10-22_at_9.07.19_PM_p4rdze.jpg",
      socialLinks: { facebook: "https://facebook.com/leaflink", twitter: "https://twitter.com/leaflink", instagram: "https://instagram.com/leaflink" }
    });
    await sendEmail(email, "Welcome to LeafLink! Your Nursery is successfully registered!", Welcomehtml);
    console.log("Welcome email sent to manager");

    res
      .cookie("authToken", token, cookieOptions)
      .status(201)
      .json({
        msg: "Manager registered",
        manager: {
          id: manager._id,
          fullName: manager.fullName,
          email: manager.email,
          role: manager.role,
          nursery: nursery._id,
        },
        nursery,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Registration failed", error: error.message });
  }
};


// ------------------- CASHIER INVITE -------------------
export const inviteCashier = async (req, res) => {
  const { email, fullName } = req.body;
  const managerId = req.user.id;

  try {
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "manager")
      return res.status(403).json({ msg: "Unauthorized" });

    const nursery = await Nursery.findById(manager.nursery);
    if (!nursery) return res.status(404).json({ msg: "Nursery not found" });

    const existingCashier = await User.findOne({ email });
    if (existingCashier) return res.status(400).json({ msg: "Cashier already exists" });

    // Generate invite code
    const inviteCode = crypto.randomBytes(4).toString("hex");

    const cashier = await User.create({
      fullName,
      email,
      role: "cashier",
      isActive: false,
      inviteCode,
      invitedAt: new Date(),
      nursery: nursery._id,
    });

    // Add to nursery cashiers array
    nursery.cashiers.push(cashier._id);
    await nursery.save();

    // Simple HTML email with just the code
    const emailHtml = `
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cashier Invitation - LeafLink.com</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; text-align:center;">
      <tr>
        <td>
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; padding:40px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">

            <!-- Image at the top -->
            <div style="text-align:center; margin-bottom:30px;">
              <img src="https://res.cloudinary.com/ddo15zw7d/image/upload/v1761155671/WhatsApp_Image_2025-10-22_at_9.07.19_PM_p4rdze.jpg" 
                   alt="LeafLink Invitation" 
                   style="max-width:100%; height:auto; border-radius:8px;">
            </div>

            <h2 style="color:#333333;">Hello ${fullName},</h2>
            <p style="color:#555555; font-size:16px;">
              You have been invited by <strong>${manager.fullName}</strong>, Manager of <strong>${nursery.name}</strong>, 
              to join <strong>LeafLink.com</strong> as a <strong>Cashier</strong>.
            </p>

            <p style="font-size:18px; margin:30px 0 20px 0; color:#04b533; font-weight:bold;">
              Your Invitation Code:
            </p>

            <div style="font-size:24px; font-weight:bold; color:#ffffff; background-color:#04b533; display:inline-block; padding:16px 28px; border-radius:8px;">
              ${inviteCode}
            </div>

            <p style="margin-top:30px; font-size:12px; color:#999999;">
              If you did not expect this invitation, you can safely ignore this email.
            </p>

            <p style="margin-top:20px; font-size:12px; color:#888888;">
              © ${new Date().getFullYear()} LeafLink.com. All rights reserved.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    await sendEmail(email, "Your Cashier Invitation Code - LeafLin.com", emailHtml);

    res.status(201).json({ msg: "Cashier invited", cashier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Failed to invite cashier", error });
  }
};


// ------------------- CASHIER ACTIVATION -------------------
export const activateCashier = async (req, res) => {
  const { email, inviteCode, password } = req.body;

  try {
    const cashier = await User.findOne({ email, inviteCode });
    if (!cashier) return res.status(400).json({ msg: "Invalid invite code or email" });

    // Set password and activate
    cashier.password = await bcrypt.hash(password, 12);
    cashier.isActive = true;
    cashier.inviteCode = null; // clear code
    await cashier.save();

    res.status(200).json({ msg: "Cashier activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Activation failed", error });
  }
};

// ------------------- LOGIN -------------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, nursery: user.nursery },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    };

    // Clear password field before returning user object
    user.password = undefined;

    res
      .cookie("authToken", token, cookieOptions)
      .status(200)
      .json({ msg: "Login successful", user,token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Login failed", error: error.message });
  }
};


// ------------------- LOGOUT -------------------
export const logoutUser = (req, res) => {
  res
    .clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ msg: "Logged out successfully" });
};



