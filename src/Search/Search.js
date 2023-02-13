import React, { useContext, useEffect, useState } from "react";
import { Container, Form, Button, Pagination } from "react-bootstrap";
import UserContext from "../userContext";
import EpisodeList from "../Episode/EpisodeList";
import { useSearchParams, createSearchParams } from "react-router-dom";
import listenApi from "../api-podcasts";
import PodcastList from "../Podcast/PodcastList"

function Search() {
  const { user } = useContext(UserContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState()

  const [searchObject, setSearchObject] = useState({q: "", type: "episode"});
  // const [currentPage, setCurrentPage] = useState(1);
  // const [nextOffset, setNextOffset] = useState();
  // const [lastOffset, setLastOffset] = useState();

  useEffect(() => {
    
    const getResults = async () => {
      const params = {}
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      const resp = await listenApi.search(params)
      setResults(resp.data.results)
      setCurrentPage((searchParams.get("offset") > 0)? ((searchParams.get("offset")/10)+1) : 1)
      setNextOffset(resp.data.next_offset);
      setLastOffset(Math.floor(resp.data.total / 10) - 10)
    }
    getResults();
  }, [searchParams])

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setSearchObject(params => ({ ...params, [name]: value }))
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setSearchParams(createSearchParams(searchObject))
  }

  const getOffset = (resultsCount) => {
    return Math.floor(resultsCount/10)-1
  }


  return <Container className="p-5">
    <h1>Results for {`"${searchParams.get('q')}"`}</h1>
    <Container fluid>
      <Form  onSubmit={handleSubmit} >
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
            defaultChecked={searchObject.type === 'episode'? true: false}
          />
          <Form.Check 
            type='radio'
            id='type-podcasts'
            label='Podcasts'
            name="type"
            value="podcast"
            defaultChecked={searchObject.type === 'podcast'? true: false}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Refine Search
        </Button>
      </Form>
    </Container>
    <br/>
    {searchParams.get('type')==='episode'? (
        <EpisodeList isDetailed={true} episodes={results} />
    ): (
        <PodcastList podcasts={results }/>
    )}
    {/* <Pagination>
      <Pagination.First disabled={currentPage === 1}  />
      <Pagination.Prev disabled={currentPage===1}  />
      <Pagination.Item active>{currentPage}</Pagination.Item>
      <Pagination.Next disabled={!nextOffset}  href=""/>
      <Pagination.Last />
    </Pagination> */}

  </Container>
}

export default Search