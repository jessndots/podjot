import React from "react";
import { Card } from "react-bootstrap";
import parse from 'html-react-parser';
import './PodcastCard.css'

function PodcastCard({ podcast }) {
  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear();;
  }

  // removes all but the first element in the description for the truncated description
  const parseDescription = (d) => {
    return parse(d, {
      replace: domNode => {
        if (!!domNode.prev) {
          return <b></b>
        }
      }
    });
  }

  return <div><Card className="border border-dark">
    <Card.Body>
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1 p-2">
          <Card.Title className="mb-3">{parse(podcast.title_highlighted || podcast.title || podcast.title_original)}</Card.Title>
          <Card.Subtitle className="mb-3 fst-italic fw-normal" >By {podcast.publisher || podcast.publisher_original}</Card.Subtitle>
          <Card.Subtitle className="fw-light">{getYear(podcast.earliest_pub_date_ms || podcast.pub_date_ms)}</Card.Subtitle>
          <br />
          <div className="text-break line-clamp">{parseDescription(podcast.description || podcast.description_original)}</div>
        </div>
        <img src={podcast.thumbnail} alt="Podcast thumbnail" style={{ width: "250px", height: "250px" }} />
      </div>

      <br />
      <a href={`/podcasts/${podcast.id}`} className="stretched-link"> </a>
    </Card.Body>
  </Card><br /></div>
}

export default PodcastCard