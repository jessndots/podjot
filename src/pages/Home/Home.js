import React, { useEffect, useState } from "react";
import listenApi from "../../api/listenApi";
import { Container } from "react-bootstrap";
import PodcastCarousel from "../../components/PodcastCarousel/PodcastCarousel";

function Home() {
  const [podcasts, setPodcasts] = useState([]);

  // on load, fetch featured podcasts from listenApi
  useEffect(() => {
    const fetchPodcasts = async () => {
        const resp = await listenApi.fetchBestPodcasts();
        setPodcasts(resp.data.podcasts);
    }
    fetchPodcasts();
  }, [])



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