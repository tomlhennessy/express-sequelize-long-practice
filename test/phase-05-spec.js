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
const { Insect, Tree, InsectTree } = require('../server/db/models')

describe('Intermediate Phase 5: Join Table & Associations', () => {

  before(async () => {
    await resetDB(DB_TEST_FILE);
    return await seedAllDB(DB_TEST_FILE);
  });

  after(async () => {
    return await removeTestDB(DB_TEST_FILE);
  });

  describe('Many to Many Association between Insect and Tree', () => {

    it('can properly associate insect with tree', async () => {

        const beforeInsectTreeCount = await InsectTree.count()

        let grant = await Tree.findOne ({
            where: { tree: "General Grant"}
        });

        const insect1 = Insect.build({name: "new insect", millimeters: 1.3});
        await insect1.save()

        const beforeGrantInsects = await grant.getInsects();
        const beforeGrantInsectsCount = beforeGrantInsects.length

        expect(beforeGrantInsects).to.be.an('array');
        expect(beforeGrantInsects).to.have.length(beforeGrantInsectsCount);

        grant.addInsects(await Insect.findAll({
            where: { name: "new insect" }
        }));

        grant = await Tree.findOne ({
            where: { tree: "General Grant"}
        });

        const afterGrantInsects = await grant.getInsects();
        const afterInsectTreeCount = await InsectTree.count()

        expect(afterGrantInsects).to.be.an('array');
        expect(afterGrantInsects).to.have.length(beforeGrantInsectsCount + 1);
        expect(afterInsectTreeCount).to.equal(beforeInsectTreeCount + 1);
    });

    it('can properly associate tree with insect', async () => {

        const beforeInsectTreeCount = await InsectTree.count()

        let insect2 = Insect.build({name: "second new insect", millimeters: 1.3});
        await insect2.save()

        const beforeInsectTrees = await insect2.getTrees();
        const beforeInsectTreesLength = beforeInsectTrees.length


        expect(beforeInsectTrees).to.be.an('array');
        expect(beforeInsectTrees).to.have.length(beforeInsectTreesLength);

        insect2.addTrees(await Tree.findAll({
            where: { tree: "Lincoln" }
        }));

        insect2 = await Insect.findOne ({
            where: { name: "second new insect"}
        });

        const afterInsectTrees = await insect2.getTrees();
        const afterInsectTreeCount = await InsectTree.count()

        expect(afterInsectTrees).to.be.an('array');
        expect(afterInsectTrees).to.have.length(beforeInsectTreesLength + 1);
        expect(afterInsectTreeCount).to.equal(beforeInsectTreeCount + 1);
    });
  });
});