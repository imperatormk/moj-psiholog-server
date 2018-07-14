module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.dropTable('Todos'),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Todos'),
};