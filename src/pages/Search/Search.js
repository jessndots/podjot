import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import { useSearchParams, createSearchParams } from "react-router-dom";
import listenApi from "../../api/listenApi";
import PodcastList from "../../components/PodcastList/PodcastList"

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState()
  const [searchObject, setSearchObject] = useState({ q: "", type: "episode" });
  const [page, setPage] = useState(1)

  // on load, grab search params and send to listenApi
  useEffect(() => {
    const getResults = async () => {
      const params = {}
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      const resp = await listenApi.search(params)
      setSearchObject(params)
      if (resp.data.results) {
        setResults(resp.data)
      }
    }
    getResults();
  }, [searchParams])

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setSearchObject(params => ({ ...params, [name]: value }))
  }

  // on form submit, change search params to perform new search
  const handleSubmit = (evt) => {
    evt.preventDefault();
    setSearchParams(createSearchParams(searchObject))
  }

  const nextPage = function () {
    if (results && results.next_offset) {
      setPage(page => page + 1)
      setSearchObject({...searchObject, offset: results.next_offset})
      setSearchParams(createSearchParams({...searchObject, offset: results.next_offset}))
    }
  }

  const prevPage = function () {
    if (results) {
      setPage(page => page - 1);
      setSearchObject({...searchObject, offset: Math.max(0, results.next_offset-20)})
      setSearchParams(createSearchParams({...searchObject, offset: Math.max(0, results.next_offset-20)}))
    }
  }

  return <Container className="p-5">
    <h1>Results for {`"${searchParams.get('q')}"`}</h1>
    <Container fluid>
      <Form onSubmit={handleSubmit} >
        <Form.Group className="mb-3" controlId="formSearch">
          <Form.Label>Search Term</Form.Label>
          <Form.Control type="string" onChange={handleChange} name="q" default={searchObject.q || searchParams.get('q')} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formType" onChange={handleChange}>
          <Form.Label>Search for...</Form.Label>
          <Form.Check
            type='radio'
            id='type-episodes'
            label='Episodes'
            name="type"
            value="episode"
            defaultChecked={searchParams.get('type') === 'episode' ? true : false}
          />
          <Form.Check
            type='radio'
            id='type-podcasts'
            label='Podcasts'
            name="type"
            value="podcast"
            defaultChecked={searchParams.get('type') === 'podcast' ? true : false}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Refine Search
        </Button>
      </Form>
    </Container>
    <br />
    {searchParams.get('type') === 'podcast' ? (
      <PodcastList podcasts={results? results.results : null} />
    ) : (
      <EpisodeList isDetailed={true} episodes={results? results.results : null} />
    )}

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
        {results && results.results.length === 10 && results.next_offset? (
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

export default Search