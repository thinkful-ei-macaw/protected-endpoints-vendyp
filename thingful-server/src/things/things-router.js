const express = require('express');
const ThingsService = require('./things-service');
const { requireAuth } = require('../middleware/basic-auth');
const thingsRouter = express.Router();

thingsRouter.route('/').get((req, res, next) => {
  ThingsService.getAllThings(req.app.get('db'))
    .then((things) => {
      res.json(ThingsService.serializeThings(things));
    })
    .catch(next);
});

thingsRouter
  .route('/:thing_id/reviews/')
  .all(requireAuth)
  .all(checkThingExists)
  .get((req, res, next) => {
    ThingsService.getReviewsForThing(req.app.get('db'), req.params.thing_id)
      .then((reviews) => {
        res.json(ThingsService.serializeThingReviews(reviews));
      })
      .catch(next);
  });

thingsRouter
  .route('/:thing_id')
  .all(requireAuth)
  .all(checkThingExists)
  .get((req, res) => {
    console.log('HERJEIEOFNOENFOENEFNFOFNEOFNEOFNEO');
    res.json(ThingsService.serializeThing(res.thing));
  });

/* async/await syntax for promises */
async function checkThingExists(req, res, next) {
  try {
    const thing = await ThingsService.getById(
      req.app.get('db'),
      req.params.thing_id
    );

    const results = await req.app.get('db').select().from('thingful_things');
    console.log('results!', results);

    if (!thing) {
      console.log(`Thing ${req.params.thing_id} does not exist!`);
      return res.status(404).json({
        error: `Thing doesn't exist`,
      });
    }

    res.thing = thing;
    console.log('CALLING NEXTCHECKING THINGS');
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = thingsRouter;
