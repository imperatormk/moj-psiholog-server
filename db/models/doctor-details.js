module.exports = (sequelize, DataTypes) => {
  const DoctorDetails = sequelize.define('DoctorDetails', {
  	name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      default: ''
    },
    bio: {
      type: DataTypes.TEXT,
      default: ''
    }
  })
  
  DoctorDetails.associate = (models) => {
    DoctorDetails.belongsTo(models.User, {
      foreignKey: 'doctorId',
      onDelete: 'CASCADE',
      as: 'doctor'
    })
  }

  return DoctorDetails
}