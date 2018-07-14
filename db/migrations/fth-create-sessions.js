module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Sessions', 'isFirst',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('Sessions'),
};