module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('SessionsMeta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      sessionId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Sessions',
          key: 'id',
          as: 'session'
        },
      }
    }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('SessionsMeta'),
}