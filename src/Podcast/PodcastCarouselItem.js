import React, { useContext } from "react";
import UserContext from "../userContext";
import { Carousel, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function PodcastCarouselItem({ podcasts, podcast }) {
  const { user } = useContext(UserContext);

  return <Card style={{ width: '18rem' }}>
      <Card.Img variant="top" src={podcast.image} />
      <Card.Body className="d-flex flex-column justify-content-between">
          <Card.Title style={{padding: '5px'}}>{podcast.title}</Card.Title>
          <Card.Subtitle>{podcast.publisher}</Card.Subtitle>
      </Card.Body>
      <a href={`/podcasts/${podcast.id}`} className="stretched-link"></a>
    </Card>
}

export default PodcastCarouselItem