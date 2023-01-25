import React from "react";
import {render} from "@testing-library/react"
import Home from "./Home";
import UserContext from "../userContext";

it("Home page welcomes anonymous user", function(){
  const user = {username: ""};
  const {getByText} = render(<UserContext.Provider value={{user}}><Home /></UserContext.Provider>);
  const h1 = getByText("Welcome to Jobly");
  expect(h1).toBeInTheDocument();
})

it("Home page welcomes logged in user by firstName", function(){
  const user = {username: "username", firstName: "first name"};
  const {getByText} = render(<UserContext.Provider value={{user}}><Home /></UserContext.Provider>);
  const h1 = getByText("Welcome back, first name!");
  expect(h1).toBeInTheDocument();
})