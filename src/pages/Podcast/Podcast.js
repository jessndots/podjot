import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import listenApi from "../../api/listenApi";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import { Container, Row, Col } from "react-bootstrap";
import parse from 'html-react-parser';
import ActionCard from "../../components/ActionCard/ActionCard";
import { useSearchParams } from "react-router-dom";

function Podcast() {
  const { podcastId } = useParams();
  const [podcast, setPodcast] = useState({});
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams();
  const [nextList, setNextList] = useState([]);


  // fetch podcast from listen api based on id param
  useEffect(() => {
    async function fetchPodcast() {
      const params = {}
      searchParams.forEach((value, key) => {
        params[key] = value
      });

      let pod
      if (podcastId) {
        page === 1 ? (
          pod = await listenApi.fetchPodcastById({ id: podcastId })
        ) : (
          pod = await listenApi.fetchPodcastById({ id: podcastId, next_episode_pub_date: params['n'] })
        )
        setPodcast(pod.data);
      }
    }
    fetchPodcast();
  }, [podcastId, searchParams, page])

  // format time as year
  const getYear = function (milliseconds) {
    const d = new Date(milliseconds);
    return d.getFullYear()
  }

  const nextPage = function () {
    if (podcast.next_episode_pub_date) {
      setPage(page => page + 1)
      setNextList(list => [...list, podcast.next_episode_pub_date])
      setSearchParams({ n: podcast.next_episode_pub_date })
    }
  }

  const prevPage = function () {
    setPage(page => page - 1);
    page === 2 ? (setSearchParams({})) : (setSearchParams({ n: nextList[page - 3] }))
  }

  return <Container className="p-5">
    <Row><h1>{podcast.title}</h1></Row>
    <Row className="d-flex">
      <Col>
        <img src={podcast.image} alt={`${podcast.title}`} style={{ maxWidth: "300px" }} /><br />
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
        {(podcast.description_highlighted || podcast.description || podcast.description_original) ? parse(podcast.description_highlighted || podcast.description || podcast.description_original) : null}
      </div>
    </Row><br />
    <Row className="p-2">
      <h2>Episodes ({podcast.total_episodes})</h2>
    </Row>
    <EpisodeList episodes={podcast.episodes} isDetailed={false} className="p-2" />
    <nav aria-label="...">
      <ul className="pagination">
        {page === 1 ? (
          <li className="page-item disabled">
            <button className="page-link" href="#" tabIndex="-1">Previous</button>
          </li>
        ) : (
          <li className="page-item">
            <button className="page-link" onClick={prevPage}>Previous</button>
          </li>
        )}
        <li className="page-item active">
          <button className="page-link" href="#">{page} <span className="sr-only"></span></button>
        </li>
        {podcast.episodes && podcast.episodes.length === 10 && podcast.next_episode_pub_date ? (
          <li className="page-item">
            <button className="page-link" onClick={nextPage}>Next</button>
          </li>
        ) : (
          <li className="page-item disabled">
            <button className="page-link">Next</button>
          </li>
        )}

      </ul>
    </nav>
  </Container>
}

export default Podcast