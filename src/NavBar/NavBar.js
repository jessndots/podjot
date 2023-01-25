import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import UserContext from "../userContext";

function NavBar({ logOut }) {
  const { user } = useContext(UserContext);

  let activeStyle = {
    textDecoration: "underline",
  };

  let activeClassName = "underline";

  if (user.username) {
    return (
      <nav className="NavBar">
        <NavLink exact to="/" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>PodJot</NavLink>
        <NavLink exact to="/podcasts" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Podcasts</NavLink>
        <NavLink exact to="/" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Search</NavLink>
        <NavLink exact to="/profile" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>{user.username}</NavLink>
        <button onClickCapture={logOut}>Log out</button>
      </nav>)
  } else {
    return (
      <nav className="NavBar">
        <NavLink exact to="/" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>PodJot</NavLink>
        <NavLink exact to="/podcasts" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Podcasts</NavLink>
        <NavLink exact to="/search" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Search</NavLink>
        <NavLink exact to="/login" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Log in</NavLink>
        <NavLink exact to="/signup" style={({ isActive }) =>
          isActive ? activeStyle : undefined
        }>Sign up</NavLink>
      </nav>);
  }


}

export default NavBar;