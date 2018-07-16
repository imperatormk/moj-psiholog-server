module.exports = {
  up: (queryInterface, Sequelize) => {
  	return queryInterface.changeColumn('Tokens', 'used', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }).then(() => {
      return queryInterface.renameColumn('Tokens', 'used', 'valid')
    })
  },
  down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('Tokens'),
};