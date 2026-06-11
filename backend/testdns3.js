 const dns = require("dns");

console.log("Node Version:", process.version);
console.log("DNS Servers Before:", dns.getServers());

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS Servers After:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.cluster0.azfcmds.mongodb.net",
  (err, addresses) => {
    console.log("ERROR:", err);
    console.log("ADDRESSES:", addresses);
  }
);