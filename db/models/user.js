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
  
  User.hook('beforeFind', (options) => { // might be revisited
  	if (!options.attributes) {
      options.attributes = {}
  	}
  	options.attributes.exclude = ['pass']
  })

  return User
}