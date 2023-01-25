import React from 'react';
import { Route, Routes, Navigate as Redirect } from 'react-router-dom';
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

function App() {
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route exact path="/podcasts/:podcastId/episodes/:episodeId" element={<Episode/>}/>
        <Route exact path="/podcasts/:podcastId/episodes" element={<EpisodeList />}/>
        <Route exact path="/podcasts/:podcastId" element={<Podcast />}/>
        <Route exact path="/podcasts" element={<PodcastList />}/>
        <Route exact path="/search" element={<Search />}/>
        <Route exact path="/profile" element={<Profile />}/>
        <Route exact path="/login" element={<LogInForm />}/>
        <Route exact path="/signup" element={<SignUpForm />} />
        <Route exact path="/" element={<Home />}/>        
      </Routes>
      <Redirect to="/" />
    </div>
  );
}

export default App;
