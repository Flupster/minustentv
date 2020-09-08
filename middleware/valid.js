// Middleware for validating data with a validator function
const valid = validate => {
  return (req, res, next) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

module.exports = valid;
