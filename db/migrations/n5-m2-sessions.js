module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Sessions', 'paymentId', {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      references: {
        model: 'Payments',
        key: 'id'
      }
    }),
  down: (queryInterface /* , Sequelize */) => {
    return Promise.all([
      queryInterface.removeColumn('Sessions', 'paymentId')
    ])
  }
}