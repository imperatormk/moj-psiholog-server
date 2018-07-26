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
    price: {
      type: DataTypes.INTEGER,
      default: -1
    },
    bio: {
      type: DataTypes.TEXT,
      default: ''
    },
    ready: {
      type: DataTypes.BOOLEAN,
      default: false
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