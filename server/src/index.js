const express = require("express");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.get("/", (req, res) => {
  res.json("Hello World!");
});

const gitHubClientId = process.env.GITHUB_CLIENT_ID;
const gitHubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const clientUrl = process.env.CLIENT_URL;
const secret = process.env.JWT_SECRET;
const cookieName = process.env.COOKIE_NAME;

const getGitHubUser = async ({ code }) => {
  const gitHubToken = await axios
    .post(`https://github.com/login/oauth/access_token?client_id=${gitHubClientId}&client_secret=${gitHubClientSecret}&code=${code}`)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });

  const decoded = querystring.parse(gitHubToken);

  const accessToken = decoded.access_token;

  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log("Error getting user from GitHub");
      throw error;
    });
};

app.get("/api/auth/github", async (req, res) => {
  const { code } = req.query;
  const { path } = req.query;

  if (!code) {
    throw new Error("No code provided");
  }

  const gitHubUser = await getGitHubUser({ code });

  const token = jwt.sign(gitHubUser, secret);

  res.cookie(cookieName, token, {
    httpOnly: true,
    domain: "localhost",
  });

  res.redirect(`${clientUrl}/${path}`);
});

app.get("/api/me", (req, res) => {
  const cookie = req.cookies[cookieName];

  try {
    const decode = jwt.verify(cookie, secret);
    return res.send(decode);
  } catch (error) {
    res.send(null);
  }
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
