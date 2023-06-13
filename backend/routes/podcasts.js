"use strict";

/** Routes for podcasts. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError, UnauthorizedError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Podcast = require("../models/podcast");

const podcastSaveSchema = require("../schemas/podcastSave.json");
const podcastUpdateSchema = require("../schemas/podcastUpdate.json");
const podcastSearchSchema = require("../schemas/podcastSearch.json");
const { dbCheckPodcast } = require("../helpers/preChecks");

const router = new express.Router();


/** POST / { podcast } =>  { podcast }
 *
 * podcast should be { username, podcastId, dateAdded, rating, notes, favorite }
 *
 * Returns { username, podcastId, dateAdded, rating, notes, favorite }
 *
 * Authorization required: admin
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, podcastSaveSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = res.locals.user
    if (user.username !== 'admin' && user.username !== req.body.username) throw new UnauthorizedError();
    const podcast = await Podcast.savePodcast(req.body.username, req.body.podcastId, req.body.data);
    return res.status(201).json({ podcast });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { podcasts: [ { username, podcastId, dateAdded, rating, notes }, ...] }
 *
 * Can provide search term to filter results
 *
 * Authorization required: logged in
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, podcastSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = res.locals.user.username
    const podcasts = await Podcast.getAllSavedPodcasts(username, q.term);
    if (podcasts.length === 0) throw new NotFoundError('No saved podcasts found.')
    
    return res.json({ podcasts });
  } catch (err) {
    return next(err);
  }
});

/** GET /favorites  =>
 *   { podcasts: [ { username, podcastId, dateAdded, rating, notes }, ...] }
 *
 * Fetches user favorite podcasts
 *
 * Authorization required: logged in
 */

router.get("/favorites", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const podcasts = await Podcast.getFavoritePodcasts(username);
    console.log('favPods from db model', podcasts)
    if (podcasts.length === 0) throw new NotFoundError('No favorited podcasts found.')
    
    return res.json({ podcasts });
  } catch (err) {
    return next(err);
  }
});

/** GET /notes  =>
 *   { podcasts: [ { username, podcastId, dateAdded, rating, notes }, ...] }
 *
 * Fetches user podcasts with notes
 *
 * Authorization required: logged in
 */

router.get("/notes", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const podcasts = await Podcast.getPodcastsWithNotes(username);
    if (podcasts.length === 0) throw new NotFoundError('No podcasts with notes found.')
    return res.json({ podcasts });
  } catch (err) {
    return next(err);
  }
});

/** GET /[podcastId]  =>  { podcast }
 *
 *  Podcast is { username, podcastId, dateAdded, rating, notes, favorite }
 *   
 *  authorization required: logged in
 */

router.get("/:podcastId", ensureLoggedIn,  async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const podcast = await Podcast.getSavedPodcast(username, req.params.podcastId);
    return res.json({ podcast });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[podcastId] { fld1, fld2, ... } => { podcast }
 *
 * Patches podcast data.
 *
 * edited fields can be: { rating, notes, favorite }
 *
 * Returns { podcastId, username, dateAdded, rating, notes, favorite }
 *
 * Authorization required: admin or matching user
 */

router.patch("/:podcastId", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, podcastUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = res.locals.user.username
    const podcast = await Podcast.updatePodcast(username, req.params.podcastId, req.body);
    return res.json({ podcast });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[podcastId]  =>  { deleted: podcastId }
 *
 * Authorization: admin or correct user
 */

router.delete("/:podcastId", ensureLoggedIn, async function (req, res, next) {
  try {
    let username;
    if (res.locals.user.username == 'admin') {
      username = req.body.username
    } else {
      username = res.locals.user.username
    }

    await Podcast.removeSave(username, req.params.podcastId);
    return res.json({ deleted: req.params.podcastId });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
