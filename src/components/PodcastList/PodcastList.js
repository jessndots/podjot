import React from "react";
import { Container } from "react-bootstrap";
import PodcastCard from "../PodcastCard/PodcastCard";

function PodcastList({podcasts}) {
  // populate podcast cards
  const pods = podcasts? (podcasts.map(pod => <PodcastCard podcast={pod} key={Math.random()}/>)): null
 
  return <Container>
      {pods}
  </Container>
}

export default PodcastList