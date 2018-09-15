/* Use with Google Cloud Functions with 128 MB RAM and HTTP trigger. */
exports.timeR = (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.send({time: new Date().getTime() / 1000.0, remoteIP: req.ip, random: req.query.random, leapSmear: true});
};
