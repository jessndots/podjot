import React from "react";
import { Container } from "react-bootstrap";
import PodcastCard from "../PodcastCard/PodcastCard";

function PodcastList({podcasts}) {
  // populate podcast cards
  const pods = podcasts? (podcasts.map(pod => <PodcastCard podcast={pod} key={pod.id}/>)): null

  return <Container>
    <ul>
      {pods}
    </ul>
  </Container>
}

export default PodcastList