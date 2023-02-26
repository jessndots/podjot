import React from "react";
import {render, fireEvent} from "@testing-library/react"
import NavBar from "./NavBar";
import UserContext from "../userContext";
import { createMemoryHistory } from "history";

import { MemoryRouter, Router} from 'react-router-dom';

const pushMock = jest.fn();

it("NavBar shows login and sign up links for anon user", function(){
  const user = {username: ""};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></MemoryRouter>);
  expect(getByText("Log in")).toBeInTheDocument();
  expect(getByText("Sign up")).toBeInTheDocument();
})

it("NavBar shows username link and log out button for logged in user", function(){
  const user = {username: "username", firstName: "first name"};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></MemoryRouter>);
  expect(getByText("username")).toBeInTheDocument();
  expect(getByText("Log out")).toBeInTheDocument();
})

it("log out button works", function(){
  // mock logOut function
   const mockLogOut = jest.fn()

  const user = {username: "username", firstName: "first name"};
  const {getByText} = render(<MemoryRouter><UserContext.Provider value={{user}}><NavBar logOut={mockLogOut}/></UserContext.Provider></MemoryRouter>);
  const logOutButton = getByText("Log out");

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

  const {getByText} = render(<Router history={history}><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></Router>);

  // home link
  fireEvent.click(getByText("Jobly"));
  expect(history.location.pathname).toBe("/");

  // companies link
  fireEvent.click(getByText("Companies"));
  expect(history.location.pathname).toBe("/companies");

  // jobs link
  fireEvent.click(getByText("Jobs"));
  expect(history.location.pathname).toBe("/jobs");

  // profile link
  fireEvent.click(getByText("username"));
  expect(history.location.pathname).toBe("/profile");
})


it("nav links work for anon user", function() {
  const history = createMemoryHistory();
  const user = {username: ""};

  const {getByText} = render(<Router history={history}><UserContext.Provider value={{user}}><NavBar /></UserContext.Provider></Router>);

  // home link
  fireEvent.click(getByText("Jobly"));
  expect(history.location.pathname).toBe("/");

  // companies link
  fireEvent.click(getByText("Companies"));
  expect(history.location.pathname).toBe("/companies");

  // jobs link
  fireEvent.click(getByText("Jobs"));
  expect(history.location.pathname).toBe("/jobs");

  // login link
  fireEvent.click(getByText("Log in"));
  expect(history.location.pathname).toBe("/login");

  // sign up link
  fireEvent.click(getByText("Sign up"));
  expect(history.location.pathname).toBe("/signup");
})