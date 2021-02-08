const error = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "something went wrong." });
};

module.exports = error;
