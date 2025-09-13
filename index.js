#!/usr/bin/env node

import express, { response } from "express";
import { Command } from "commander";
import fetch from "node-fetch";
import chalk from "chalk";
import fs from "fs";

const program = new Command();

program
  .option(
    "--port <port>",
    "Specify  the port on which the caching proxy server will run."
  )
  .option(
    "--origin <orgin>",
    "Specifiy the URL of the server to which the requests will be forwarded. "
  );

const option = program.opts();

program.parse(process.argv);
console.log(`Port chosen: ${option.port}, ${option.origin}`);
const app = express();

let numbericPort = Number(option.port);
// validate the input

// if (isNaN(numbericPort)) {
//   console.error("Port number needed to be a Number");
//   process.exit(1);
// }

// if (isNaN(numbericPort)) {
//   console.error("Port number needed to be a Number");
//   process.exit(1);
// }

// start the express server

const log_data = "This is the log data";

let requestCount = 0;

let cache = {};
console.log("cache", cache);

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

  console.log("path", url);

  const query = `${option.origin}${url}`;
  requestCount++;
  console.log(`Request Number: ${requestCount}, to URL: ${query}`);
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
