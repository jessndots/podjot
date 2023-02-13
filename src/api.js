import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class PodcastApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${PodcastApi.token}` };
    const params = (method === "get")
      ? data
      : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  // ******************************* USER ROUTES **************************************
  /** Get user by username */
  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Get list of users */
  static async getUsers() {
    let res = await this.request(`users`);
    return res.users
  }

  /** Add new user (accessible by admin only - so they can add new admin) */
  static async addUser(data) {
    let res = await this.request(`users`, data, "post");
    return res.user
  }

  /** Edit user by username */
  static async editUser(oldUsername, newData) {
    let res = await this.request(`users/${oldUsername}`, newData, "patch");
    return res.user
  }

  /** Delete user by username */
  static async deleteUser(username) {
    let res = await this.request(`users/${username}`, {}, "delete");
    return res
  }

  /** Sign up user, returns token */
  static async signUpUser(data) {
    let res = await this.request(`auth/register`, data, "post");
    this.token = res.token
    return res.token
  }

  /** Log in user, returns token */
  static async logInUser(data) {
    let res = await this.request(`auth/token`, data, "post");
    this.token = await res.token
    return res
  }



  // ******************************* PODCAST ROUTES **************************************
  /** Get user's saved podcast details */
  static async getSavedPodcast(podcastId) {
    let res = await this.request(`podcasts/${podcastId}`);
    return res.podcast;
  }

  /** Get list of user's saved podcasts */
  static async getSavedPodcasts() {
    let res = await this.request(`podcasts`);
    return res.podcasts
  }

  /** Save podcast with user notes, rating, etc */
  static async savePodcast(d) {
    const data = {username: d.username, podcastId: d.podcastId, data: {rating: d.rating, notes: d.notes}}
    let res = await this.request(`podcasts`, data, "post");
    return res.podcast
  }

  /** Edit user's saved podcast details */
  static async editSavedPodcast(d) {
    const newData = {rating: d.rating, notes: d.notes};
    let res = await this.request(`podcasts/${d.podcastId}`, newData, "patch");
    return res.podcast
  }

  /** Delete user's saved podcast details */
  static async removeSavedPodcast(podcastId) {
    let res = await this.request(`podcasts/${podcastId}`, {}, "delete");
    return res
  }



  // ******************************* EPISODE ROUTES **************************************
  /** Get user's saved episode details */
  static async getSavedEpisode(episodeId) {
    let res = await this.request(`episodes/${episodeId}`);
    return res.episode;
  }

  /** Get list of user's saved episodes */
  static async getSavedEpisodes() {
    let res = await this.request(`episodes`);
    return res.episodes
  }

  /** Save episode with user notes, rating, etc */
  static async saveEpisode(data) {
    let res = await this.request(`episodes`, data, "post");
    return res.episode
  }

  /** Edit user's saved episode details */
  static async editSavedEpisode(episodeId, newData) {
    let res = await this.request(`episodes/${episodeId}`, newData, "patch");
    return res.episode
  }

  /** Delete user's saved episode details */
  static async removeSavedEpisode(episodeId) {
    let res = await this.request(`episodes/${episodeId}`, {}, "delete");
    return res
  }
}

export default PodcastApi

