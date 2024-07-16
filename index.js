import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

import express from "express";
import { nanoid } from "nanoid";

const isUrlValid = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/urlform.html");
});

app.post("/shorten", (req, res) => {
  const isValidUrl = isUrlValid(req.body.longUrl);
  if (!isValidUrl) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid longUrl",
    });
  }
  const shortUrl = nanoid(5);
  const urlsFromFile = fs.readFileSync("urls.json", { encoding: "utf-8" });
  const urlsJson = JSON.parse(urlsFromFile);

  urlsJson[shortUrl] = req.body.longUrl; // Adding new url k-v pair in the json

  fs.writeFileSync("urls.json", JSON.stringify(urlsJson));
  res.json({
    success: true,
    data: `https://localhost:10000/${shortUrl}`,
  });
});

app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;
  const urls = fs.readFileSync("urls.json", { encoding: "utf-8" });
  const urlsJson = JSON.parse(urls);
  const longUrl = urlsJson[shortUrl];
  if (!longUrl) {
    return res.end("Invalid Short Url");
  }
  res.redirect(longUrl);
});

app.listen(10_000, () => console.log(`Server is up and running at port 10000`));
