#!/usr/bin/env node

import express from "express";
import { Command } from "commander";
import chalk from "chalk";

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

app.get(/.*/, (req, res) => {
  res.status(404).send("404 not found");
  console.log("req", req.path);
});

app.listen(option.port, () =>
  console.log(`Server has been started on Port: ${option.port}`)
);

// create a cache type

// then create the endpoints

// then add logging as per hte project requirements.
