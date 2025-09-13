#!/usr/bin/env node

import express, { response } from "express";
import { Command } from "commander";
import fetch from "node-fetch";
import chalk from "chalk";
import fs from "fs";

const filePath = "./cache.json";

const program = new Command();

function loadCache() {
  // try and load the cache file its its not there create one from scratch

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "{}", "utf8");
      //read the file
    }
    const raw = fs.readFileSync(filePath, "utf-8");

    const cache = JSON.parse(raw);

    // console.log(cache);
    // cache is now a js object
    return cache;
  } catch (err) {
    console.error("Failed to load the cache");
    process.exit(1);
  }
}

function saveCache(cache) {
  try {
    const stringCache = JSON.stringify(cache, null, 2);
    fs.writeFileSync(filePath, stringCache, "utf-8");
    console.log("Succesfully writen to cache");
  } catch (err) {
    console.error("Failed saving to cache");
  }
}
function clearCache() {
  try {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "{}", "utf-8");
      console.log("Succesfully cleared the cache down");
      process.exit(0);
    } else {
      console.error(
        "No Cache file to clear down please run the service to create one and rerun this command"
      );
      process.exit(1);
    }
  } catch (err) {
    console.error(`Failed to clear the cache, please check ${filePath} `);
    process.exit(1);
  }
}

program
  .option(
    "--port <port>",
    "Specify  the port on which the caching proxy server will run."
  )
  .option(
    "--origin <orgin>",
    "Specifiy the URL of the server to which the requests will be forwarded. "
  );

program.option("--clear-cache", "Clear the cache for the proxy server");

program.parse(process.argv);
const option = program.opts();

if (option.clearCache) {
  clearCache();
  process.exit(0);
}
console.log(`Port chosen: ${option.port}, ${option.origin}`);

let numbericPort = Number(option.port);
// validate the input

if (isNaN(numbericPort) && numbericPort > 3000 && numbericPort < 5000) {
  console.error("Port number needed to be a Number");
  process.exit(1);
}

const originIncludes = "https://";

if (!option.origin.includes(originIncludes)) {
  console.error(`origin needs to include ${originIncludes}`);
  process.exit(1);
}

const app = express();

// start the express server
let cache = loadCache();

app.get(/.*/, async (req, res) => {
  const url = req.url;

  if (cache[url]) {
    if (cache[url].body.error == false) {
      return res.status(404).json({ error: cache[url].body.reason });
    }
    for (const key of Object.keys(cache[url].header)) {
      res.set(key, cache[url].header[key]);
    }
    res.set("X-cache", "HIT");

    console.log("cache_HIT");

    return res.status(200).json(cache[url].body);
  }

  const query = `${option.origin}${url}`;
  //   console.log(`Request Number: ${requestCount}, to URL: ${query}`);
  try {
    const result = await fetch(query);

    // we need to add the correct response headers to the res
    let resultHeader = {};
    result.headers.forEach((value, key) => {
      const blocked = [
        "content-length",
        "transfer-encoding",
        "connection",
        "content-encoding",
      ];
      if (!blocked.includes(key.toLowerCase()) && value !== undefined) {
        res.set(key, value);
        resultHeader[key] = value;
      }
    });

    const data = await result.json();

    //Cache the reponse (header and body)

    cache[url] = { body: data, header: resultHeader };
    saveCache(cache);
    res.set("X-Cache", "MISS");
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ error: "Issue fetching request" });
  }
});

app.listen(option.port, () =>
  console.log(`Server has been started on Port: ${option.port}`)
);
