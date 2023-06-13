import React, { useEffect, useState, useContext } from "react";
import { Container } from "react-bootstrap";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import listenApi from "../../api/listenApi";
import PodcastList from "../../components/PodcastList/PodcastList"
import podjotApi from "../../api/podjotApi";
import { useNavigate } from "react-router-dom";
import UserContext from "../../userContext";

function MyPodcasts() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [favPods, setFavPods] = useState([])
  const [favEps, setFavEps] = useState([])
  const [podNotes, setPodNotes] = useState([])
  const [epNotes, setEpNotes] = useState([])

  // if no user logged in, go to login page
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  // on load, grab search params and send to listenApi
  useEffect(() => {

    const getFavPods = async () => {
      try {
        const saveData = await podjotApi.getFavoritePodcasts()
        const pods = []
        for (let pod of saveData) {
          const resp = await listenApi.fetchPodcastById({ id: pod.podcastId })
          const podcast = resp.data
          podcast["podjot"] = pod
          pods.push(podcast)
        }
        setFavPods(pods)
      }
      catch (err) {
        setFavPods(null)
      }
    }
    const getFavEps = async () => {
      try {
        const saveData = await podjotApi.getFavoriteEpisodes()
        const eps = []
        for (let ep of saveData) {
          const resp = await listenApi.fetchEpisodeById({ id: ep.episodeId })
          const episode = resp.data
          episode["podjot"] = ep
          eps.push(episode)
        }
        setFavEps(eps)
      }
      catch (err) {
        setFavEps(null)
      }
    }
    const getPodNotes = async () => {
      try {
        const saveData = await podjotApi.getPodcastsWithNotes()
        const pods = []
        for (let pod of saveData) {
          const resp = await listenApi.fetchPodcastById({ id: pod.podcastId })
          const podcast = resp.data
          podcast["podjot"] = pod
          pods.push(podcast)
        }
        setPodNotes(pods)
      } catch (err) {
        setPodNotes(null)
      }

    }
    const getEpNotes = async () => {
      try {
        const saveData = await podjotApi.getEpisodesWithNotes()
        const eps = []
        for (let ep of saveData) {
          const resp = await listenApi.fetchEpisodeById({ id: ep.episodeId })
          const episode = resp.data
          episode["podjot"] = ep
          eps.push(episode)
        }
        setEpNotes(eps)
      }
      catch (err) {
        setEpNotes(null)
      }
    }
    if (podjotApi.token) {
      getFavPods();
      getFavEps();
      getPodNotes();
      getEpNotes();
    }

  }, [])

  // const nextPage = function () {
  //   if (results && results.next_offset) {
  //     setPage(page => page + 1)
  //     setSearchObject({ ...searchObject, offset: results.next_offset })
  //     setSearchParams(createSearchParams({ ...searchObject, offset: results.next_offset }))
  //   }
  // }

  // const prevPage = function () {
  //   if (results) {
  //     setPage(page => page - 1);
  //     setSearchObject({ ...searchObject, offset: Math.max(0, results.next_offset - 20) })
  //     setSearchParams(createSearchParams({ ...searchObject, offset: Math.max(0, results.next_offset - 20) }))
  //   }
  // }

  return <Container className="p-5">
    <h1>My Podcasts</h1>

    {/* <div className="accordion" id="accordionExample">
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingOne">
          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
            Accordion Item #1
          </button>
        </h2>
        <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
          </div>
        </div>
      </div>
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingTwo">
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
            Accordion Item #2
          </button>
        </h2>
        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <strong>This is the second item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
          </div>
        </div>
      </div>
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingThree">
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
            Accordion Item #3
          </button>
        </h2>
        <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
          <div className="accordion-body">
            <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
          </div>
        </div>
      </div>
    </div> */}
    <nav>
      <div className="nav nav-tabs" id="nav-tab" role="tablist">
        <button className="nav-link active" id="favPods-tab" data-bs-toggle="tab" data-bs-target="#favPods" type="button" role="tab" aria-controls="favPods" aria-selected="true">Favorite Podcasts</button>
        <button className="nav-link" id="favEps-tab" data-bs-toggle="tab" data-bs-target="#favEps" type="button" role="tab" aria-controls="favEps" aria-selected="false">Favorite Episodes</button>
        <button className="nav-link" id="podNotes-tab" data-bs-toggle="tab" data-bs-target="#podNotes" type="button" role="tab" aria-controls="podNotes" aria-selected="false">Podcast Notes</button>
        <button className="nav-link" id="epNotes-tab" data-bs-toggle="tab" data-bs-target="#epNotes" type="button" role="tab" aria-controls="epNotes" aria-selected="false">Episode Notes</button>
      </div>
    </nav>
    <div className="tab-content" id="nav-tabContent">
      <div className="tab-pane fade show active" id="favPods" role="tabpanel" aria-labelledby="favPods-tab">
        {favPods ? (
          <>
            <br />
            <PodcastList podcasts={favPods} />
          </>
        ) : (
          <>
            <br />
            <p>You have not saved any podcasts to your favorites</p>
          </>
        )}</div>
      <div className="tab-pane fade" id="favEps" role="tabpanel" aria-labelledby="favEps-tab">
        {favEps ? (
          <>
            <br />
            <EpisodeList episodes={favEps} isDetailed={true} />
          </>
        ) : (
          <>
            <br />
            <p>You have not saved any episodes to your favorites</p>
          </>
        )}
      </div>
      <div className="tab-pane fade" id="podNotes" role="tabpanel" aria-labelledby="podNotes-tab">
        {podNotes ? (
          <>
            <br />
            <PodcastList podcasts={podNotes} />
          </>
        ) : (
          <>
            <br />
            <p>You have not taken notes on any podcasts</p>
          </>
        )}
      </div>
      <div className="tab-pane fade" id="epNotes" role="tabpanel" aria-labelledby="epNotes-tab">
        {epNotes ? (
          <>
            <br />
            <EpisodeList episodes={epNotes} isDetailed={true} />
          </>
        ) : (
          <>
            <br />
            <p>You have not taken notes on any episodes</p>
          </>
        )}
      </div>
    </div>


    {/* <nav aria-label="...">
      <ul className="pagination">
        {page === 1 ? (
          <li className="page-item disabled">
            <a className="page-link" href="#" tabindex="-1">Previous</a>
          </li>
        ) : (
          <li className="page-item">
            <button className="page-link" onClick={prevPage}>Previous</button>
          </li>
        )}
        <li className="page-item active">
          <button className="page-link" href="#">{page} <span className="sr-only"></span></button>
        </li>
        {results.results.length === 10 && results.next_offset ? (
          <li className="page-item">
            <button className="page-link" onClick={nextPage}>Next</button>
          </li>
        ) : (
          <li className="page-item disabled">
            <button className="page-link">Next</button>
          </li>
        )}

      </ul>
    </nav> */}
  </Container>
}

export default MyPodcasts