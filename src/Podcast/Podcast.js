import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../userContext";
import listenApi from "../api-podcasts";
import EpisodeList from "../Episode/EpisodeList";

function Podcast() {
  const {user} = useContext(UserContext);
  const [podcast, setPodcast] = useState({});
  const {podcastId} = useParams();

  // fetch podcast data from api along with episode list
  useEffect(() => {
    async function fetchPodcast() {
      const pod = await listenApi.fetchPodcastById({id: podcastId});
      console.log("Podcast.js => useEffect fetch podcast", pod.data)
      setPodcast(pod.data);
      const genres = await listenApi.fetchPodcastGenres();
      console.log(genres);
    }
    fetchPodcast();
  }, [podcastId])

  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear()
  }



  return <div>
    <h1>{podcast.title}</h1>
    <p>{podcast.publisher}</p>
    <p>{getYear(podcast.earliest_pub_date_ms)}</p>
    <img src={podcast.image} alt={`${podcast.title}`}/>

    <p><b>About this podcast: </b>{podcast.description}</p>
    <h2>Episodes</h2>
    <EpisodeList episodes={podcast.episodes}/>
  </div>
}

export default Podcast