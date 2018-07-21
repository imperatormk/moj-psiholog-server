module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('DoctorDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
      	type: Sequelize.STRING,
      	allowNull: false
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      bio: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      doctorId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'doctorId',
        },
      },
    }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('DoctorDetails'),
}