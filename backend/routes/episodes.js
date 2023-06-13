"use strict";
/** Routes for episodes. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Episode = require("../models/episode");

const episodeSaveSchema = require("../schemas/episodeSave.json");
const episodeUpdateSchema = require("../schemas/episodeUpdate.json");
const episodeSearchSchema = require("../schemas/episodeSearch.json");
const { dbCheckEpisode } = require("../helpers/preChecks");

const router = new express.Router();


/** POST / { episode } =>  { episode }
 *
 * episode should be { username, episodeId, dateListened, timeStopped, rating, notes }
 *
 * Returns { username, episodeId, dateListened, timeStopped, rating, notes }
 *
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, episodeSaveSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = res.locals.user
    if (user.username !== 'admin' && user.username !== req.body.username) throw new UnauthorizedError();
    const episode = await Episode.saveEpisode(req.body.username, req.body.episodeId, req.body.data);
    return res.status(201).json({ episode });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { episodes: [ { username, episodeId, dateAdded, rating, notes, favorite }, ...] }
 *
 * Can provide search term to filter results
 *
 * Authorization required: logged in
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, episodeSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = res.locals.user.username
    const episodes = await Episode.getAllSavedEpisodes(username, q.term);
    if (episodes.length === 0) throw new NotFoundError('No saved episodes found.')
    
    return res.json({ episodes });
  } catch (err) {
    return next(err);
  }
});

/** GET /favorites  =>
 *   { episodes: [ { username, episodeId, dateAdded, rating, notes, favorite }, ...] }
 *
 * Fetches favorited episodes
 *
 * Authorization required: logged in
 */

router.get("/favorites", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const episodes = await Episode.getFavoriteEpisodes(username);
    if (episodes.length === 0) throw new NotFoundError('No favorited episodes found.')
    
    return res.json({ episodes: episodes });
  } catch (err) {
    return next(err);
  }
});

/** GET /notes  =>
 *   { episodes: [ { username, episodeId, dateAdded, rating, notes, favorite }, ...] }
 *
 * Fetches episodes with notes
 *
 * Authorization required: logged in
 */

router.get("/notes", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const episodes = await Episode.getEpisodesWithNotes(username);
    console.log(episodes)
    if (episodes.length === 0) throw new NotFoundError('No episodes with notes found.')
    return res.json({ episodes: episodes });
  } catch (err) {
    return next(err);
  }
});

/** GET /[episodeId]  =>  { episode }
 *
 *  Episode is { username, episodeId, dateAdded, rating, notes, favorite }
 *   
 *  authorization required: logged in
 */

router.get("/:episodeId", ensureLoggedIn,  async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const episode = await Episode.getSavedEpisode(username, req.params.episodeId);
    return res.json({ episode });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[episodeId] { fld1, fld2, ... } => { episode }
 *
 * Patches episode data.
 *
 * edited fields can be: { rating, notes, favorite }
 *
 * Returns { episodeId, username, dateAdded, rating, notes, favorite }
 *
 * Authorization required: admin or matching user
 */

router.patch("/:episodeId", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, episodeUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = res.locals.user.username
    const episode = await Episode.updateEpisode(username, req.params.episodeId, req.body);
    return res.json({ episode });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[episodeId]  =>  { deleted: episodeId }
 *
 * Authorization: admin or correct user
 */

router.delete("/:episodeId", ensureLoggedIn, async function (req, res, next) {
  try {
    let username;
    if (res.locals.user.username == 'admin') {
      username = req.body.username
    } else {
      username = res.locals.user.username
    }

    await Episode.removeSave(username, req.params.episodeId);
    return res.json({ deleted: req.params.episodeId });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
