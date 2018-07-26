module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    pass: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
  })
  
  User.associate = (models => {
  	User.hasMany(models.Blog, {
      foreignKey: { name: 'posterId' },
      onDelete: 'SET NULL',
      as: 'blogs'
    })
  
    User.hasOne(models.DoctorDetails, {
      foreignKey: { name: 'doctorId' },
      onDelete: 'CASCADE',
      as: 'details'
    })
  })

  return User
}