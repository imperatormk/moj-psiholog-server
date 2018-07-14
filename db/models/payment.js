module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    paymentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  	status: {
      type: DataTypes.ENUM('pending', 'refunded', 'completed'),
      allowNull: false
    }
  })
  
  Payment.associate = (models) => {
    Payment.belongsTo(models.Session, {
      foreignKey: { name: 'sessionId', allowNull: true }, // hmm
      onDelete: 'SET NULL',
    })
  }

  return Payment
}