/* ---------------- This section must be at the top: ---------------- */
for (let module in require.cache) { delete require.cache[module] }
const path = require('path');
const DB_TEST_FILE = 'db/' + path.basename(__filename, '.js') + '.db';
const SERVER_DB_TEST_FILE = 'server/' + DB_TEST_FILE;
process.env.DB_TEST_FILE = SERVER_DB_TEST_FILE;
/* ------------------------------------------------------------------ */

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
let chaiHttp = require('chai-http');
let server = require('../server/app');
chai.use(chaiHttp);
const expect = chai.expect;

const { resetDB, seedAllDB, removeTestDB } = require('./utils/test-utils');
const { Insect, InsectTree } = require('../server/db/models')

describe('Intermediate Phase 6: Dynamic Seeding', () => {

  before(async () => {
    await resetDB(DB_TEST_FILE);
    return await seedAllDB(DB_TEST_FILE);
  });

  after(async () => {
    return await removeTestDB(DB_TEST_FILE);
  });

  describe('Dynamic Seeding of Insect Tree Associations', () => {
    let butterfly;
    let spider;

    it('InsectTree join table includes required records from seeding', async () => {
        butterfly = await Insect.findOne({where: {name: "Western Pygmy Blue Butterfly"}})
        const butterflyTrees = await InsectTree.findAll({
            where: { insectId: butterfly.id },
            raw: true,
        });
        expect(butterflyTrees).to.have.length(4);

        spider = await Insect.findOne({where: {name: "Patu Digua Spider"}})
        const spiderTrees = await InsectTree.findAll({
            where: { insectId: spider.id },
            raw: true,
        });

        expect(spiderTrees).to.have.length(1);
    });
  });
});