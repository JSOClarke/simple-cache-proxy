## Simple Cache Proxy (https://github.com/JSOClarke/simple-cache-proxy)

This is a **caching proxy server** written in JavaScript using Node.js, Express, and a few other libraries. It's designed to intercept HTTP GET requests, forward them to a specified origin server, and **cache the responses** to speed up subsequent requests for the same data. It stores the cached responses in a `cache.json` file.

---

## Getting Started

### Prerequisites

You'll need to have **Node.js** installed on your system.

### Installation

1.  Clone this repository or download the code.

2.  Navigate to the project directory.

3.  Install the necessary dependencies by running the following command in your terminal:

    ```bash
    npm install express commander node-fetch chalk
    ```

    This will install the required libraries, including Express for the web server, Commander for command-line options, and Node-Fetch for making HTTP requests.

---

## Usage

Run the script from your terminal using the following command:

```bash
node your_script_name.js --port <port_number> --origin <origin_url>
```

- **`--port <port_number>`**: Specify the port on which the proxy server will listen. It should be a number between 3000 and 5000.
- **`--origin <origin_url>`**: Provide the URL of the server you want to proxy. This URL must start with `https://`.

### Example

To run the proxy server on port `4000` and proxy requests to `https://api.example.com`:

```bash
node your_script_name.js --port 4000 --origin https://api.example.com
```

Once started, any GET request you send to `http://localhost:4000/<path>` will be forwarded to `https://api.example.com/<path>`. The response from the origin server will be cached. Subsequent requests for the same path will be served directly from the cache.

---

## Commands

### Clear Cache

You can clear the cached data by running the script with the `--clear-cache` flag. This will delete the existing `cache.json` file and create a new, empty one.

```bash
node your_script_name.js --clear-cache
```

---

## How It Works

1.  When the server starts, it loads the cache from `cache.json`. If the file doesn't exist, it creates an empty one.
2.  On a **GET request**, the server first checks if the requested URL exists in the cache.
3.  **Cache Hit:** If the URL is found, it retrieves the cached response (headers and body) and sends it back to the client with an `X-Cache: HIT` header.
4.  **Cache Miss:** If the URL is not in the cache, the server makes a new request to the **origin server**, forwards the response to the client with an `X-Cache: MISS` header, and then saves the response to the `cache.json` file for future use.
