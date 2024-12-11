// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();
const { sequelize } = require('sequelize');

// Import models - DO NOT MODIFY
const { Insect, Tree } = require('../db/models');
const { Op } = require("sequelize");

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    try {
        // fetch trees with insects using eager loading
        const trees = await Tree.findAll({
            include: {
                model: Insect,
                attributes: ['id', 'name'], // only include id and name for insect
                through: { attributes: [] }, // exclude relationship data
            },
            where: {
                '$Insects.id$': { [Sequelize.Op.not]: null }, // only trees with insects
            },
            order: [[{ model: Insect }, 'name', 'ASC']], // order insects by name
        });

        res.json(trees);
    } catch (err) {
        next(err);
    }
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    try {
        // fetch all insects
        const insects = await Insect.findAll();

        // lazy load associated trees for each insect
        const results = await Promise.all(
            insects.map(async (insect) => {
                const trees = await insect.getTrees({
                    attributes: ['id', 'tree'], // only include id and tree for trees
                    order: [['tree', 'ASC']], // order trees alphabetically by name
                });

                return {
                    id: insect.id,
                    name: insect.name,
                    description: insect.description,
                    trees,
                }
            })
        )

        res.json(results);
    } catch (err) {
        next(err);
    }
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here

// Export class - DO NOT MODIFY
module.exports = router;
