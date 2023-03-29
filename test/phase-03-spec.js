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
const { Tree } = require('../server/db/models')

describe('Basic Phase 3 - DELETE Using Sequelize Queries', () => {

  before(async () => {
    await resetDB(DB_TEST_FILE);
    return await seedAllDB(DB_TEST_FILE);
  });

  after(async () => {
    return await removeTestDB(DB_TEST_FILE);
  });

  describe('DELETE /trees/:id (valid requests)', () => {
    let newTree;

    before(async () => {
      const reqBody = {
        "name": "Tree to be deleted",
        "location": "My new Backyard",
        "height": 150,
        "size": 67.4
      };

      newTreeResponse = await chai.request(server)
        .post('/trees')
        .send(reqBody)

      newTree = await Tree.findOne({ where: {tree: "Tree to be deleted"}, raw: true})

    })

    it('deleted a tree by id', async () => {

        const allTreesBefore = await Tree.count()

        await chai.request(server)
            .delete(`/trees/${newTree.id}`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('success');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal(`Successfully removed tree ${newTree.id}`);

            });
        const allTreesAfter = await Tree.count()
        expect(allTreesAfter).to.equal(allTreesBefore - 1)
    });
  });


  describe('DELETE /trees/:id (invalid requests)', () => {

    it('cannot delete a tree that does not exist', async () => {

        const allTreesBefore = await Tree.count()

        let id = 17;
        await chai.request(server)
            .delete(`/trees/${id}`)
            .then((res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('status');
                expect(res.body.status).to.equal('not-found');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal(`Could not remove tree ${id}`);
                expect(res.body).to.have.property('details');
                expect(res.body.details).to.equal('Tree not found');

            });
        const allTreesAfter = await Tree.count()
        expect(allTreesAfter).to.equal(allTreesBefore)
    });
  });
});