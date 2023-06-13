import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import EpisodeCard from "../EpisodeCard/EpisodeCard"

function EpisodeList({ episodes, isDetailed }) {
  const [cards, setCards] = useState([])

  // on change of props, reset the episode cards
  useEffect(() => {
    if (episodes) {
      setCards(episodes.map(episode => <EpisodeCard episode={episode} isDetailed={isDetailed} key={episode.id} />))
    }
  }, [episodes, isDetailed])

  return <Container>
    {cards}

  </Container>
}

export default EpisodeList