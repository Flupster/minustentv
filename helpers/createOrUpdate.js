module.exports = scheme => {
  scheme.statics.createOrUpdate = async function(query, update, options) {
    const doc = await this.findOne(query);
    if (!doc) return this.create(update);

    await doc.updateOne(query, update, options);
    return this.findOne(query);
  };
};
