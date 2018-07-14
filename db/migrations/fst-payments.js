module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      paymentId: {
        type: Sequelize.STRING,
      	allowNull: false
      },
      amount: {
      	type: Sequelize.INTEGER,
      	allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'refunded'),
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
        onDelete: 'SET NULL',
        references: {
          model: 'Sessions',
          key: 'id'
        },
      }
    }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('Payments'),
};