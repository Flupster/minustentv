module.exports = scheme => {
  scheme.statics.createOrUpdate = async function(query, update) {
    await this.updateOne(query, update, { upsert: true });
    return this.findOne(query);
  };
};
