import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../userContext";
import listenApi from "../api-podcasts";
import { Container, Row, Col, Offcanvas, Form, Card, Button } from "react-bootstrap";
import parse from 'html-react-parser';
import ActionCard from "../ActionCard/ActionCard";
import PodJotApi from "../api"

function Episode() {
  const { user } = useContext(UserContext);
  const { episodeId } = useParams();
  const [episode, setEpisode] = useState({});

  useEffect(() => {
    async function fetchEpisode() {
      if (episodeId) {
        const ep = await listenApi.fetchEpisodeById({ id: episodeId });
        setEpisode(ep.data);
      }
    }
    fetchEpisode();
  }, [episodeId])

  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear()
  }

  return (<Container className="p-5">
    {episode? (<>
      <Row><h1>{episode.title}</h1></Row>
      {episode.podcast? (
      <Row >
        <h2 className="p-2"><a href={`/podcasts/${episode.podcast.id}`} className="text-decoration-none text-reset">{episode.podcast.title}</a></h2>
      </Row>
    ): null}
      <Row>
        <Col>
          <img src={episode.image} alt={`${episode.title}`} style={{maxWidth: "300px"}} /><br />
        </Col>
        <Col>
          <ActionCard media={episode} />
        </Col>
      </Row>
      <Row>
        <audio controls src={episode.audio}>
          <source src={episode.audio}/>
            Your browser does not support the audio element.
        </audio>
      </Row><br/>
      <Row className="p-4">
          <p><b>About this episode: </b></p>
          {(episode.description_highlighted || episode.description || episode.description_original)? parse(episode.description_highlighted || episode.description || episode.description_original) : null}
      </Row>
    </>) : null}
    

  </Container>)
}

      export default Episode