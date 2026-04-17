const fs = require("fs");
const path = require("path");
const { isAuthenticatedRequest } = require("../admin-auth");

const fileMap = {
  index: path.join(process.cwd(), "public", "index.html"),
  assessment: path.join(process.cwd(), "public", "assessment.html"),
  thankyou: path.join(process.cwd(), "public", "thank-you.html"),
  adminlogin: path.join(process.cwd(), "public", "admin-login.html"),
  admin: path.join(process.cwd(), "public", "admin.html"),
  results: path.join(process.cwd(), "public", "results.html")
};

module.exports = async (req, res) => {
  const fileKey = (req.query.file || "index").toString();
  const requiresAdmin = fileKey === "admin" || fileKey === "results";
  const filePath =
    requiresAdmin && !isAuthenticatedRequest(req)
      ? fileMap.adminlogin
      : fileMap[fileKey] || fileMap.index;

  try {
    const html = await fs.promises.readFile(filePath, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (requiresAdmin && !isAuthenticatedRequest(req)) {
      res.setHeader("Cache-Control", "no-store");
    }
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send("Unable to load page.");
  }
};
