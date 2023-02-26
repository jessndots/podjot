import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react"
import SignUpForm from "./SignUpForm";
import UserContext from "../userContext";
import reactRouterDom from 'react-router-dom';

const mockPush = jest.fn();
jest.mock('react-router-dom');

it("sign up page displays form", function () {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  const user = { username: "" };

  const { getByText } = render(<UserContext.Provider value={{ user }}><SignUpForm error={[]}/></UserContext.Provider>)

  expect(getByText("Username")).toBeInTheDocument();
})

it("signup form handles submission", async function () {
  // create mocks for signup and history.push
  const mockSignUp = jest.fn(() => {
    return { token: "testToken" }
  });

  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  // create anon user
  const user = { username: "" };

  // render component
  const { getByLabelText, getByTestId } = render(<UserContext.Provider value={{ user }}><SignUpForm signUp={mockSignUp} error={[]}/></UserContext.Provider>);

  // fill out form
  fireEvent.change(getByLabelText("First Name"), { target: { value: 'first name' } })
  fireEvent.change(getByLabelText("Last Name"), { target: { value: 'last name' } })
  fireEvent.change(getByLabelText("Email Address"), { target: { value: 'email' } })
  fireEvent.change(getByLabelText("Username"), { target: { value: 'username' } })
  fireEvent.change(getByLabelText("Password"), { target: { value: 'password' } })

  // submit form
  await waitFor(() => {
    fireEvent.submit(getByTestId("form"));
  })

  // expect mocks to be called once each
  expect(mockSignUp).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith("/")
})


it("shows error on empty form submission", async function () {
  reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush });

  // create anon user
  const user = { username: "" };

  // render component
  const { getByText, getByTestId } = render(<UserContext.Provider value={{ user }}><SignUpForm error={[]}/></UserContext.Provider>);

  // submit empty form
  await waitFor(() => {
    fireEvent.submit(getByTestId("form"));
  })

  // expect invalid signup notification
  expect(getByText("All fields are required")).toBeInTheDocument();

})

