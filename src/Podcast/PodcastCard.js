import React, { useContext } from "react";
import UserContext from "../userContext";
import { Card, Container, Stack, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import parse from 'html-react-parser';

function PodcastCard({ podcast }) {
  const { user } = useContext(UserContext);
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.toLocaleDateString("en") ;
  }


  return <div><Card >
  <Card.Body>
      <div className="d-flex justify-content-between">
        <div>
          <Card.Title>{parse(podcast.title_highlighted) || podcast.title || podcast.title_original}</Card.Title>
          <br />
          <Card.Subtitle>{podcast.publisher}</Card.Subtitle><br />
          <br />
        </div>
        <img src={podcast.thumbnail} style={{width:"100px", height:"100px"}} />
      </div>
    
    <div className="d-flex justify-content-between">
      <Card.Subtitle className="fw-light">{getYear(podcast.earliest_pub_date_ms || podcast.pub_date_ms)}</Card.Subtitle>
    </div>
    <br />
    <div className="d-block">
      <Card.Text className="text-truncate">{parse(podcast.description_highlighted || podcast.description || podcast.description_original)}</Card.Text>
    </div>
    <a href={`/podcasts/${podcast.id}`} className="stretched-link"></a>
  </Card.Body>
</Card><br /></div>
}

export default PodcastCard