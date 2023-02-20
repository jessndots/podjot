import React from "react";
import { Card } from "react-bootstrap";
import parse from 'html-react-parser';
import './PodcastCard.css'

function PodcastCard({ podcast }) {
  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.toLocaleDateString("en") ;
  }

  // removes all but the first p element for the truncated description
  const parseDescription = (d) => {
    return parse(d, {
      replace: domNode => {
        if (!!domNode.prev) {
          return <></>
        }
      }
    });
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
        <img src={podcast.thumbnail} alt="Podcast thumbnail" style={{width:"100px", height:"100px"}} />
      </div>
    
    <div className="d-flex justify-content-between">
      <Card.Subtitle className="fw-light">{getYear(podcast.earliest_pub_date_ms || podcast.pub_date_ms)}</Card.Subtitle>
    </div>
    <br />
    <div className="d-block">
      <Card.Text className="text-break line-clamp">{parseDescription(podcast.description || podcast.description_original)}</Card.Text>
    </div>
    <a href={`/podcasts/${podcast.id}`} className="stretched-link"></a>
  </Card.Body>
</Card><br /></div>
}

export default PodcastCard