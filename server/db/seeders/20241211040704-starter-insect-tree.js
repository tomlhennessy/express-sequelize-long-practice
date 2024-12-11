'use strict';
const { Insect, Tree } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // find insect and tree records by name
    const westernPygmy = await Insect.findOne({where: { name: 'Western Pygmy Blue Butterfly' } });
    const patuDigua = await Insect.findOne({where: {name: 'Patu Digua Spider' } });

    const generalSherman = await Tree.findOne({ where: { tree: 'General Sherman' } });
    const generalGrant = await Tree.findOne({ where: { tree: 'General Grant' } });
    const lincoln = await Tree.findOne({ where: {tree: 'Lincoln' } });
    const stagg = await Tree.findOne({ where: { tree: 'Stagg' } });

    // insert records into InsectTrees
    await queryInterface.bulkInsert('InsectTrees', [
      { insectId: westernPygmy.id, treeId: generalSherman.id, createdAt: new Date(), updatedAt: new Date() },
      { insectId: westernPygmy.id, treeId: generalGrant.id, createdAt: new Date(), updatedAt: new Date() },
      { insectId: westernPygmy.id, treeId: lincoln.id, createdAt: new Date(), updatedAt: new Date() },
      { insectId: westernPygmy.id, treeId: stagg.id, createdAt: new Date(), updatedAt: new Date() },
      { insectId: patuDigua.id, treeId: stagg.id, createdAt: new Date(), updatedAt: new Date() },
    ])
  },

  async down (queryInterface, Sequelize) {
    // remove records from InsectTrees
    await queryInterface.bulkDelete('InsectTrees', null, {});
  }
};
