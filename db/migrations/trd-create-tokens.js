module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Tokens', 'expiresAfter', {
      type: Sequelize.STRING,
      defaultValue: '1 day'
    }),
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Tokens'),
};