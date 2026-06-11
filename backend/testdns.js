const dns = require("dns");

console.log("Using Google DNS...");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.resolveSrv(
  "_mongodb._tcp.cluster0.azfcmds.mongodb.net",
  (err, addresses) => {
    console.log("ERROR:", err);
    console.log("ADDRESSES:", addresses);
  }
);