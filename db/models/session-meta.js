module.exports = (sequelize, DataTypes) => {
  const SessionsMeta = sequelize.define('SessionsMeta', {
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  })
  
  /* SessionMeta.associate = (models) => {
    SessionMeta.belongsTo(models.Session, {
      foreignKey: 'sessionId',
      onDelete: 'CASCADE',
      as: 'session'
    })
  } */

  return SessionsMeta
}