
const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    const adminUsername = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !passwordHash) {
      return res.status(500).json({
        success: false,
        message: "Administrator login is not configured."
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter your username and password."
      });
    }

    const usernameMatches = username === adminUsername;
    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error("Session error:", error);

        return res.status(500).json({
          success: false,
          message: "Unable to start your session."
        });
      }

      req.session.authenticated = true;
      req.session.username = adminUsername;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);

          return res.status(500).json({
            success: false,
            message: "Unable to save your login session."
          });
        }

        return res.json({
          success: true,
          message: "Login successful.",
          user: {
            username: adminUsername
          }
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected login error occurred."
    });
  }
});

router.get("/me", (req, res) => {
  if (!req.session || req.session.authenticated !== true) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue."
    });
  }

  return res.json({
    success: true,
    user: {
      username: req.session.username
    }
  });
});

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to log out."
      });
    }

    res.clearCookie("emena.sid", {
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    });

    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  });
});

module.exports = router;
