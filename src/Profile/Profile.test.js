import React from "react";
import { render, fireEvent } from "@testing-library/react"
import Profile from "./Profile";
import UserContext from "../userContext";
import reactRouterDom from 'react-router-dom';

const pushMock = jest.fn();
jest.mock('react-router-dom');

it("Profile page redirects anon user to login page", function () {
  const user = { username: "" };
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock });
  render(<UserContext.Provider value={{ user }}><Profile /></UserContext.Provider>)
  expect(pushMock).toHaveBeenCalledTimes(1);
  expect(pushMock).toHaveBeenCalledWith('/login');

})

it("Profile page displays user info", function () {
  const user = { username: "username", firstName: "first name", lastName: "last name", email: "jessndoty@gmail.com" };
  const { getByText } = render(<UserContext.Provider value={{ user }}><Profile /></UserContext.Provider>);
  const username = getByText("Username: username");
  const email = getByText("Email Address: jessndoty@gmail.com");
  expect(username).toBeInTheDocument();
  expect(email).toBeInTheDocument();
})

it("Profile page allows user to edit user info", function () {
  // create mocks for editProfile and history.push
  const mockEditProfile = jest.fn(() => {
    user.firstName = "test";
  })

  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock });

  // create test user
  const user = { username: "username", firstName: "first name", lastName: "last name", email: "jessndoty@gmail.com" };

  // render component
  const { getByText, getByLabelText, getByTestId } = render(<UserContext.Provider value={{ user }}><Profile editProfile={mockEditProfile}/></UserContext.Provider>);

  // check first name
  const firstName = getByText("First Name: first name")
  expect(firstName).toBeInTheDocument();

  // click edit button
  fireEvent.click(getByText("Edit"));

  // edit name
  fireEvent.change(getByLabelText("First Name:"), { target: { value: 'test' } })

  // save changes
  fireEvent.submit(getByTestId("form"));

  // expect first name to have changed
  const changedName = getByText("First Name: test");
  expect(changedName).toBeInTheDocument();

  // expect mocks to be called once each
  expect(pushMock).toHaveBeenCalledTimes(1);
  expect(mockEditProfile).toHaveBeenCalledTimes(1);

})

