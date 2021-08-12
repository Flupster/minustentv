module.exports = (ip) => (req, res, next) => {
  req.ip === ip ? next() : res.status(403).json();
};
