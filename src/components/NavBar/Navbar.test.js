import React from "react";
import {render, fireEvent} from "@testing-library/react"
import NavBar from "./NavBar";
import UserContext from "../../userContext";
import { createMemoryHistory } from "history";
import '@testing-library/jest-dom'

import { MemoryRouter, Router} from 'react-router-dom';

const pushMock = jest.fn();

it("NavBar shows login and sign up links for anon user", function(){
  const user = {username: ""};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></MemoryRouter>);
  expect(getByText("Log In")).toBeInTheDocument();
  expect(getByText("Sign Up")).toBeInTheDocument();
})

it("NavBar shows username link and log out button for logged in user", function(){
  const user = {username: "username", firstName: "first name"};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></MemoryRouter>);
  expect(getByText("Account")).toBeInTheDocument();
  expect(getByText("Log Out")).toBeInTheDocument();
})

it("log out button works", function(){
  // mock logOut function
   const mockLogOut = jest.fn()

  const user = {username: "username", firstName: "first name"};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar logOut={mockLogOut}/></UserContext.Provider></MemoryRouter>);
  const logOutButton = getByText("Log Out");

  // check if logged in
  expect(logOutButton).toBeInTheDocument();

  // click log out
  fireEvent.click(logOutButton);

  // check if mock log out function was called
  expect(mockLogOut).toHaveBeenCalledTimes(1);
})

it("nav links work for logged in user", function() {
  const history = createMemoryHistory();
  const user = {username: "username", firstName: "first name"};
  const mockLogOut = jest.fn()
  history.push = jest.fn();
  
  const {getByText} = render(<MemoryRouter history={history}><UserContext.Provider value={{user}}><NavBar logOut={mockLogOut}/></UserContext.Provider></MemoryRouter>);

  // home link
  fireEvent.click(getByText("PodJot"));
  expect(history.location.pathname).toBe("/");

  // profile link
  fireEvent.click(getByText("Account"));
  expect(history.push).toHaveBeenCalledWith('/profile');
  expect(history.location.pathname).toBe("/profile");
})


it("nav links work for anon user", function() {
  const history = createMemoryHistory();
  const user = {username: ""};

  const mockLogOut = jest.fn()
  const {getByText} = render(<MemoryRouter history={history}><UserContext.Provider value={{user}}><NavBar logOut={mockLogOut}/></UserContext.Provider></MemoryRouter>);

  // home link
  fireEvent.click(getByText("PodJot"));
  expect(history.location.pathname).toBe("/");

  // login link
  fireEvent.click(getByText("Log In"));
  expect(history.location.pathname).toBe("/login");

  // sign up link
  fireEvent.click(getByText("Sign Up"));
  expect(history.location.pathname).toBe("/signup");
})