module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.dropTable('TodoItems'),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('TodoItems'),
};