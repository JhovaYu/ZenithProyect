'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'apellido', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'nombre'
    });

    await queryInterface.addColumn('Users', 'matricula', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'apellido'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'matricula');
    await queryInterface.removeColumn('Users', 'apellido');
  }
};
