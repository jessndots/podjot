import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import listenApi from "../../api/listenApi";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import { Container, Row, Col } from "react-bootstrap";
import parse from 'html-react-parser';
import ActionCard from "../../components/ActionCard/ActionCard";

function Podcast() {
  const { podcastId } = useParams();
  const [podcast, setPodcast] = useState({});

  // fetch podcast from listen api based on id param
  useEffect(() => {
    async function fetchPodcast() {
      if(podcastId) {
        const pod = await listenApi.fetchPodcastById({ id: podcastId });
        setPodcast(pod.data);
      }
    }
    fetchPodcast();
  }, [podcastId])

  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear()
  }

  return <Container className="p-5">
    <Row><h1>{podcast.title}</h1></Row>
    <Row className="d-flex">
      <Col>
        <img src={podcast.image} alt={`${podcast.title}`} style={{maxWidth:"300px"}} /><br />
      </Col>
      <Col>
          <ActionCard media={podcast} type='podcast' />
      </Col>
    </Row>
    <Row>
      <p>{podcast.publisher}
        <br /> {getYear(podcast.earliest_pub_date_ms)}</p>
    </Row>
    <Row className="p-2">
      <div>
        <p><b>About this podcast: </b></p>
        {(podcast.description_highlighted || podcast.description || podcast.description_original)? parse(podcast.description_highlighted || podcast.description || podcast.description_original) : null}
      </div>
    </Row><br />
    <Row className="p-2">
      <h2>Episodes</h2>
    </Row>
    <EpisodeList episodes={podcast.episodes} isDetailed={false} className="p-2"/>
  </Container>
}

export default Podcast