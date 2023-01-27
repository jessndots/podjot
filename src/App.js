import React, { useState, useContext } from 'react';
import { Route, Routes, Redirect, useNavigate } from 'react-router-dom';
import './App.css';
import UserContext from './userContext';
import NavBar from './NavBar/NavBar';
import Home from './Home/Home';
import Episode from './Episode/Episode';
import EpisodeList from './Episode/EpisodeList';
import Podcast from './Podcast/Podcast';
import PodcastList from './Podcast/PodcastList';
import Profile from './Profile/Profile';
import LogInForm from './LogInForm/LogInForm';
import SignUpForm from './SignUpForm/SignUpForm';
import PodJotApi from './api';
import Search from './Search/Search.js'
import { Container } from 'react-bootstrap';

function App() {
  const { user, setUser, token, setToken } = useContext(UserContext);
  const [podcasts, setPodcasts] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const navigate = useNavigate();
  const [signUpErr, setSignUpErr] = useState({});

  const signUpUser = (formData) => {
    async function signUp(data) {
      try {
        const res = await PodJotApi.signUpUser(data);
        setToken(res);
        setSignUpErr([]);
        return res
      } catch (err) {
        return {errors: err}
      }
    }
    return signUp(formData);
  }

  const logInUser = async (formData) => {
    try {
      const res = await PodJotApi.logInUser(formData);
      setToken(res.token);
      return res
    } catch(err) {
      return {errors: err}
    }

  }

  const logOutUser = () => {
    async function logOut() {
      setToken("");
      PodJotApi.token = null;
      navigate("/")
    }
    logOut();
  }

  return (
    <div>
      <Container fluid className="App">
        <NavBar logOut={logOutUser} />
        <Routes>
          <Route path="/podcasts/:podcastId/episodes/:episodeId" element={<Episode />} />
          <Route path="/podcasts/:podcastId" element={<Podcast />} />
          <Route path="/podcasts" element={<PodcastList />} />
          <Route path="/search" element={<Search />} />
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
