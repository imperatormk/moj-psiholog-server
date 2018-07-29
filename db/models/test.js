module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define('Test', {
    data: {
      type: DataTypes.JSON,
      allowNull: false
    }
  })
  
  Test.associate = (models) => {
    Test.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  }

  return Test
}