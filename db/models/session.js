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
    isFirst: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'canceled', 'ongoing', 'completed'),
      default: 'pending'
    },
  	sessionKey: { // are you sure about that
  	  type: DataTypes.STRING,
      allowNull: false
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
  
  	Session.hasOne(models.SessionsMeta, {
      foreignKey: { name: 'sessionId', allowNull: true },
      onDelete: 'CASCADE',
      as: 'meta'
    })
  }

  return Session
}