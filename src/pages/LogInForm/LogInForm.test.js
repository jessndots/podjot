import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react"
import LogInForm from "./LogInForm";
import UserContext from "../userContext";
import reactRouterDom from 'react-router-dom';

const mockPush = jest.fn();
jest.mock('react-router-dom');

it("log in page displays form", function () {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  const user = { username: "" };

  const { getByText } = render(<UserContext.Provider value={{ user }}><LogInForm /></UserContext.Provider>)

  expect(getByText("Username")).toBeInTheDocument();
})

it("LogIn form handles submission", async function () {
  // create mocks for logIn and history.push
  const mockLogIn = jest.fn(() => {
    return { token: "testToken" }
  });

  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  // create anon user
  const user = { username: "" };

  // render component
  const { getByLabelText, getByTestId } = render(<UserContext.Provider value={{ user }}><LogInForm logIn={mockLogIn} /></UserContext.Provider>);

  // enter username
  fireEvent.change(getByLabelText("Username"), { target: { value: 'test' } })

  // enter password
  fireEvent.change(getByLabelText("Password"), { target: { value: 'password' } })

  // submit form
  await waitFor(() => {
    fireEvent.submit(getByTestId("form"));
  })

  // expect mocks to be called once each
  expect(mockLogIn).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith("/")
})


it("LogIn form handles invalid login", async function () {
  // create mocks for logIn and history.push
  const mockLogIn = jest.fn(()=> {
    isInvalid=true
  });

  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  // create anon user
  const user = { username: "" };

  // render component
  const { getByText, getByTestId } = render(<UserContext.Provider value={{ user }}><LogInForm logIn={mockLogIn} /></UserContext.Provider>);

  // submit empty form
  await waitFor(() => {
    fireEvent.submit(getByTestId("form"));
  })

  // expect mocks to be called once each
  expect(mockLogIn).toHaveBeenCalledTimes(1);

  // expect invalid login notification
  expect(getByText("Incorrect username or password.")).toBeInTheDocument();

})


it("redirects users who are already logged in", function () {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  const user = { username: "username" };

  render(<UserContext.Provider value={{ user }}><LogInForm /></UserContext.Provider>);

  expect(mockPush).toHaveBeenCalledWith("/")
})
