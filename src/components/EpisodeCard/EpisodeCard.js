import React from "react";
import { Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import parse from 'html-react-parser';
import './EpisodeCard.css'


function EpisodeCard({episode, isDetailed}) {
  // grab podcast id from the params
  const {podcastId} = useParams();

  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.toLocaleDateString("en") ;
  }

  // format the time length of episode
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


  return <div><Card className="border border-dark" >
    <Card.Body>
      {isDetailed? (<>
        <div className="d-flex justify-content-between mb-4">
          <div className="flex-grow-1">
            <Card.Title className="mb-3">{parse(episode.title_highlighted || episode.title || episode.title_original)}</Card.Title>
            <Card.Subtitle className="mb-2">{episode.podcast? (parse(episode.podcast.title_highlighted) || episode.podcast.title || episode.podcast.title_original): null}</Card.Subtitle>
            <Card.Text className="mb-2">By {episode.podcast?  (episode.podcast.publisher || episode.podcast.publisher_original): null}</Card.Text>
            <br/>
            <div className="d-flex justify-content-between">
              <Card.Subtitle className="fw-light">{getYear(episode.pub_date_ms)}</Card.Subtitle>
              <Card.Subtitle className="fw-light">{getTime(episode.audio_length_sec)}</Card.Subtitle>
            </div>
          </div>
          <div className="ms-3">
            <img src={episode.thumbnail} alt={`Episode thumbnail`} style={{width:"150px", height:"150px"}} />
          </div>
        </div>
      </>
      ): (<>
        <div className="d-flex justify-content-between mb-4 flex-grow-1">
          <div className="flex-grow-1">
            <Card.Title>{parse(episode.title_highlighted || episode.title || episode.title_original)}</Card.Title>
            <br />
            <div className="d-flex justify-content-between" > 
              <Card.Subtitle className="fw-light">{getYear(episode.pub_date_ms)}</Card.Subtitle>
              <Card.Subtitle className="fw-light">{getTime(episode.audio_length_sec)}</Card.Subtitle>
            </div>
            <br/>
          </div>
          <div className="ms-3">
            <img src={episode.thumbnail} alt='Episode thumbnail' style={{width:"150px", height:"150px"}} />
          </div>
        </div>
        </>)
      }
      <div className="d-block">
        {episode? (
          <div id='card-description' className="text-break line-clamp">{parseDescription(episode.description || episode.description_original)}</div>
        ): null}
      </div>
      <a href={`/podcasts/${podcastId}/episodes/${episode.id}`} className="stretched-link"></a>
    </Card.Body>
  </Card>
  <br />
  </div>
}

export default EpisodeCard