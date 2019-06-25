module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {});
  User.associate = (models) => {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'articles',
      onDelete: 'CASCADE'
    });
  };

  return User;
};
