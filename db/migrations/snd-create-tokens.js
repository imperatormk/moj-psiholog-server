module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Tokens', 'used', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Tokens'),
};