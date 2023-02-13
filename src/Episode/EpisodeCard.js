import React, { useContext } from "react";
import UserContext from "../userContext";
import { Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import parse from 'html-react-parser';


function EpisodeCard({episode, isDetailed}) {
  const {user} = useContext(UserContext);
  const {podcastId} = useParams();
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.toLocaleDateString("en") ;
  }

  const getTime = function(s) {
    const m = Math.floor(s/60);
    const hours = Math.floor(m/60)
    const remainderS = s % 60;
    const remainderM = m % 60;
    let minutes=remainderM, seconds=remainderS
    if (remainderS < 10) {seconds=`0${remainderS}`}
    if (remainderM < 10) {minutes= `0${remainderM}`}

    return `${hours}:${minutes}:${seconds}`
  }


  return <div><Card >
    <Card.Body>
      {isDetailed? (
        <div className="d-flex justify-content-between">
          <div>
            <Card.Title>{parse(episode.title_highlighted || episode.title || episode.title_original)}</Card.Title>
            <br />
            <Card.Subtitle>{episode.podcast? (parse(episode.podcast.title_highlighted) || episode.podcast.title || episode.podcast.title_original): null}</Card.Subtitle><br />
            <br />
          </div>
          <img src={episode.thumbnail} style={{width:"100px", height:"100px"}} />
        </div>
      ): <Card.Title>{parse(episode.title_highlighted || episode.title || episode.title_original)}</Card.Title>
      }
      <div className="d-flex justify-content-between">
        <Card.Subtitle className="fw-light">{getYear(episode.pub_date_ms)}</Card.Subtitle>
        <Card.Subtitle className="fw-light">{getTime(episode.audio_length_sec)}</Card.Subtitle>
      </div>
      <br />
      <div className="d-block">
        {episode? (
          <Card.Text className="text-truncate">{(episode.description_highlighted || episode.description || episode.description_original).replace('<p>', '')}</Card.Text>
        ): null}
      </div>
      <a href={`/podcasts/${podcastId}/episodes/${episode.id}`} className="stretched-link"></a>
    </Card.Body>
  </Card>
  <br />
  </div>
}

export default EpisodeCard