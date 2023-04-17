const { setupBefore, setupChai, removeTestDB, runSQLQuery } = require('./utils/test-utils');
const chai = setupChai();
const expect = chai.expect;

describe('Intermediate Phase 6: Dynamic Seeding', () => {
  let DB_TEST_FILE, models, server;
  before(async () => ({ server, models, DB_TEST_FILE } = await setupBefore(__filename)));
  after(async () => await removeTestDB(DB_TEST_FILE));

  describe('Dynamic Seeding of Insect Tree Associations', () => {
    let butterfly;
    let spider;

    it('InsectTree join table includes required records from seeding', async () => {
        butterfly = await models.Insect.findOne({where: {name: "Western Pygmy Blue Butterfly"}})
        const butterflyTrees = await models.InsectTree.findAll({
            where: { insectId: butterfly.id },
            raw: true,
        });
        expect(butterflyTrees).to.have.length(4);

        spider = await models.Insect.findOne({where: {name: "Patu Digua Spider"}})
        const spiderTrees = await models.InsectTree.findAll({
            where: { insectId: spider.id },
            raw: true,
        });

        expect(spiderTrees).to.have.length(1);
    });
  });
});
