import React, { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import EpisodeList from "../../components/EpisodeList/EpisodeList";
import { useSearchParams, createSearchParams } from "react-router-dom";
import listenApi from "../../api/listenApi";
import PodcastList from "../../components/PodcastList/PodcastList"

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState()

  const [searchObject, setSearchObject] = useState({q: "", type: "episode"});

  // on load, grab search params and send to listenApi
  useEffect(() => {
    const getResults = async () => {
      const params = {}
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      const resp = await listenApi.search(params)
      setResults(resp.data.results)
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


  </Container>
}

export default Search