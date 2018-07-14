module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Users'),
};