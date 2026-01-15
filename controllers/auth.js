// Controllers folder: Authentication logic (login, register, logout)
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();

    // Notify Admins about new registration
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      if (admin.notificationPreferences?.customerAlerts !== false) {
        await Notification.create({
          user: admin._id,
          title: "New Customer!",
          message: `${newUser.username} just joined the family.`,
          type: "tracking", // Or a new type if preferred
          link: "/admin/customers",
          read: false
        });
      }
    }

    res.status(200).json("User has been created.");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("Login attempt for:", req.body.username);
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      console.log("User not found in DB");
      return next(createError(404, "User not found!"));
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isPasswordCorrect) {
      console.log("Password comparison failed for user:", req.body.username);
      return next(createError(400, "Wrong password or username!"));
    }

    console.log("Login successful for:", req.body.username);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    const { password, ...otherDetails } = user._doc;
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
      .status(200)
      .json({ ...otherDetails });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(createError(404, "Email not found. Please check and try again."));
    }

    // Here implies user exist. In a real app we would generate valid token and send email.
    // For now we just return success so frontend knows the email is valid.

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    next(err);
  }
};