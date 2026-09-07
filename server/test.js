const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveSrv('_mongodb._tcp.studentcollaboration.ee9nepx.mongodb.net', (err, addresses) => {
  console.log(err, addresses);
});