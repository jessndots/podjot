import React, { useContext, useEffect, useState } from "react";
import UserContext from "../userContext";
import listenApi from "../api-podcasts";
import { Container } from "react-bootstrap";
import PodcastCarousel from "../Podcast/PodcastCarousel";

function Home() {
  const {user} = useContext(UserContext);
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    const fetchPodcasts = async () => {
        const resp = await listenApi.fetchBestPodcasts();
        setPodcasts(resp.data.podcasts);
    }
    fetchPodcasts();
  }, [user.username])



  return <Container>
    <h1>Welcome to PodJot</h1>
    <p>Track your podcast listening with your own notes and ratings!</p>
    <Container className="" >
      <h2>Featured Podcasts</h2>
      <PodcastCarousel podcasts={podcasts} />
    </Container>
  </Container>
}

export default Home