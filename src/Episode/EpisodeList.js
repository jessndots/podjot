import React, { useContext, useEffect, useState } from "react";
import UserContext from "../userContext";
import { Container } from "react-bootstrap";
import EpisodeCard from "./EpisodeCard"

function EpisodeList({episodes, isDetailed}) {
  const {user} = useContext(UserContext);
  const [cards, setCards] = useState([])
  
  useEffect(() => {
    if (episodes) {
      setCards(episodes.map(episode => <EpisodeCard episode={episode} isDetailed={isDetailed} key={episode.id}  />))
    }
  }, [episodes])

  return <Container>
    {cards}
  </Container>
}

export default EpisodeList