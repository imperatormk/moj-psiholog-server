module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'canceled', 'ongoing', 'completed'),
      default: 'pending'
    }
  })
  
  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'doctorId',
      onDelete: 'SET NULL',
      as: 'doctor'
    })
  
  	Session.belongsTo(models.User, {
      foreignKey: 'patientId',
      onDelete: 'SET NULL',
      as: 'patient'
    })
  
  	Session.belongsTo(models.Payment, {
      foreignKey: { name: 'paymentId', allowNull: true },
      onDelete: 'SET NULL'
    })
  }

  return Session
}