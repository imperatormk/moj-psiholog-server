module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    purpose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valid: {
      type: DataTypes.BOOLEAN,
      default: true,
    },
  	expiresAfter: {
      type: DataTypes.STRING,
      default: '1 day'
    },
  })
  
  Token.associate = (models) => {
    Token.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })
  }

  return Token
}