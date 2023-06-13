import React from "react";
import {render} from "@testing-library/react"
import Home from "./Home";
import UserContext from "../../userContext";
import '@testing-library/jest-dom'

it("Home page welcomes anonymous user", function(){
  const user = {username: ""};
  const {getByText} = render(<UserContext.Provider value={{user}}><Home /></UserContext.Provider>);
  const h1 = getByText("Welcome to PodJot");
  expect(h1).toBeInTheDocument();
})

