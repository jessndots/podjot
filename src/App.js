import React, { useState, useContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import UserProvider from './userContext';
import NavBar from './components/NavBar/NavBar';
import Home from './pages/Home/Home';
import Episode from './pages/Episode/Episode';
import Podcast from './pages/Podcast/Podcast';
import Profile from './pages/Profile/Profile';
import LogInForm from './pages/LogInForm/LogInForm';
import SignUpForm from './pages/SignUpForm/SignUpForm';
import Search from './pages/Search/Search';
import { Container } from 'react-bootstrap';
import listenApi from './api/listenApi';
import podjotApi from './api/podjotApi';
import MyPodcasts from './pages/MyPodcasts/MyPodcasts';

function App() {
  const { setToken } = useContext(UserProvider);
  const [searchResults, setSearchResults] = useState({});
  const [searchQuery, setSearchQuery] = useState("")

  const navigate = useNavigate();


  const signUpUser = (formData) => {
    async function signUp(data) {
      try {
        const res = await podjotApi.signUpUser(data);
        setToken(res);
        return res
      } catch (err) {
        return {errors: err}
      }
    }
    return signUp(formData);
  }

  const logInUser = async (formData) => {
    try {
      const res = await podjotApi.logInUser(formData);
      setToken(res.token);
      return res
    } catch(err) {
      return {errors: err}
    }

  }

  const logOutUser = () => {
    async function logOut() {
      setToken("");
      podjotApi.token = null;
      navigate("/")
    }
    logOut();
  }

  const simpleSearch = (query) => {
    async function search(q) {
      const results = await listenApi.search({q: q})
      setSearchResults(results.data)
      setSearchQuery(q)
      return results.data
    }
    return search(query.search);
  }

  return (
    <div>
      <Container fluid className="App">
        <NavBar logOut={logOutUser} search={simpleSearch}/>
        <Routes>
          <Route path="/podcasts/:podcastId/episodes/:episodeId" element={<Episode />} />
          <Route path="/podcasts/:podcastId" element={<Podcast />} />
          <Route path="/search" element={<Search results={searchResults} query={searchQuery}/>} />
          <Route path="/mypodcasts" element={<MyPodcasts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LogInForm logIn={logInUser} />} />
          <Route path="/signup" element={<SignUpForm signUp={signUpUser} />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>

    </div>
  );
}

export default App;
