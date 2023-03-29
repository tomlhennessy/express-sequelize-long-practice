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

describe('Basic Phase 1 - SELECT Using Sequelize Queries', () => {

  before(async () => {
    await resetDB(DB_TEST_FILE);
    return await seedAllDB(DB_TEST_FILE);
  });

  after(async () => {
    return await removeTestDB(DB_TEST_FILE);
  });

  describe('B. GET /trees', () => {
    let treeResponse;

    it('successfully makes a request to GET /trees', async () => {
      treeResponse = await chai.request(server)
        .get('/trees')

      expect(treeResponse).to.not.be.null;
      expect(treeResponse).to.have.status(200);
    });

    it('returns JSON response of trees with heightFt, tree and id attributes', async () => {
        expect(treeResponse).to.be.json;
        expect(treeResponse.body).to.be.a('array');
        expect(treeResponse.body.length).to.eq(5);

        treeResponse.body.forEach((tree) => {
          expect(tree).to.be.an('object');
          expect(tree).to.have.own.property('id');
          expect(tree).to.have.own.property('tree');
          expect(tree).to.have.own.property('heightFt');
        })
    });

    it('returns trees in the correct order (tallest to shortest)', async () => {
      const trees = treeResponse.body;

      expect(trees[0].heightFt).to.equal(274.9);
      expect(trees[1].heightFt).to.equal(268.1);
      expect(trees[2].heightFt).to.equal(255.8);
      expect(trees[3].heightFt).to.equal(243);
      expect(trees[4].heightFt).to.equal(240.9);
    });
  });


  describe('C. GET /trees/:id', () => {
    let treeIdResponse;

    it('successfully makes a request to GET /trees/:id', async () => {
      treeIdResponse = await chai.request(server)
        .get('/trees/1')

      expect(treeIdResponse).to.not.be.null;
      expect(treeIdResponse).to.have.status(200);
    });

    it('returns JSON response of valid tree with all attributes', async () => {
      expect(treeIdResponse).to.be.json;
      expect(treeIdResponse.body).to.be.an('object');
      expect(treeIdResponse.body).to.have.own.property('id');
      expect(treeIdResponse.body.id).to.equal(1);
      expect(treeIdResponse.body).to.have.own.property('tree');
      expect(treeIdResponse.body.tree).to.equal('General Sherman');
      expect(treeIdResponse.body).to.have.own.property('location');
      expect(treeIdResponse.body.location).to.equal('Sequoia National Park');
      expect(treeIdResponse.body).to.have.own.property('heightFt');
      expect(treeIdResponse.body.heightFt).to.equal(274.9);
      expect(treeIdResponse.body).to.have.own.property('groundCircumferenceFt');
      expect(treeIdResponse.body.groundCircumferenceFt).to.equal(102.6);
      expect(treeIdResponse.body).to.have.own.property('createdAt');
      expect(treeIdResponse.body).to.have.own.property('updatedAt');
    });

    it('returns error message for invalid id (number)', async () => {

      const invalidTreeIdResponse = await chai.request(server)
        .get('/trees/123')

      expect(invalidTreeIdResponse).to.not.be.null;
      expect(invalidTreeIdResponse).to.have.status(400);
      expect(invalidTreeIdResponse.body).to.have.own.property("status");
      expect(invalidTreeIdResponse.body.status).to.equal("not-found");
      expect(invalidTreeIdResponse.body).to.have.own.property("message");
      expect(invalidTreeIdResponse.body.message).to.equal("Could not find tree 123");
      expect(invalidTreeIdResponse.body).to.have.own.property("details");
      expect(invalidTreeIdResponse.body.details).to.equal("Tree not found");
    });

    it('returns error message for invalid id (letters)', async () => {

      const invalidTreeIdResponse = await chai.request(server)
        .get('/trees/twenty')

      expect(invalidTreeIdResponse).to.not.be.null;
      expect(invalidTreeIdResponse).to.have.status(400);
      expect(invalidTreeIdResponse.body).to.have.own.property("status");
      expect(invalidTreeIdResponse.body.status).to.equal("not-found");
      expect(invalidTreeIdResponse.body).to.have.own.property("message");
      expect(invalidTreeIdResponse.body.message).to.equal("Could not find tree twenty");
      expect(invalidTreeIdResponse.body).to.have.own.property("details");
      expect(invalidTreeIdResponse.body.details).to.equal("Tree not found");
    });
  });
});