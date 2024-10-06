'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'rol', {
      type: Sequelize.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
      defaultValue: 'student'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'rol');
  }
};
