import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import UserContext from "../userContext";
import PodcastCard from "./PodcastCard";

function PodcastList({podcasts}) {
  const {user} = useContext(UserContext);

  const pods = podcasts? (podcasts.map(pod => <PodcastCard podcast={pod} key={pod.id}/>)): null

  return <Container>
    <ul>
      {pods}
    </ul>
  </Container>
}

export default PodcastList