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
      price: {
      	type: Sequelize.INTEGER,
      	defaultValue: -1
      },
      bio: {
        type: Sequelize.TEXT,
        defaultValue: '',
      },
      ready: {
      	type: Sequelize.BOOLEAN,
      	defaultValue: false
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