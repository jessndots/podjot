import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container } from "react-bootstrap";

function SignUpForm({ signUp }) {
  const INITIAL_STATE = { firstName: "", lastName: "", email: "", username: "", password: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(fData => ({ ...fData, [name]: value }))
  }

  // on submit, check for errors, display them if any, create user if none
  const handleSubmit = async (evt) => {
    try {
        evt.preventDefault();
        setErrors({})
        const newErrors = findFormErrors()
        if ( Object.keys(newErrors).length > 0 ) {
          setErrors(newErrors)
          setValidated(false);
        } else {
          const res = await signUp(formData);
          if (!res.errors) {
            setValidated(true);
            setFormData(INITIAL_STATE);
            navigate("/");
          } else {
            if (res.errors[0].includes("Duplicate username")) {
              setErrors(errs => ({...errs, username: 'This username is unavailable'}))
            } else {
              setErrors({other: res.errors})
            }
          }
        } 
    } catch (err) {
      return
    }
  }

  // function to find the form errors
  const findFormErrors = () => {
    const { firstName, lastName, email, username, password } = formData
    const newErrors = {}

    // name errors
    if ( !firstName || firstName === '' ) {newErrors.firstName ='First Name is required'} 
    else if ( firstName.length > 30 ) {newErrors.firstName = 'First Name is too long'}

    if ( !lastName || lastName === '' ) {newErrors.lastName ='Last Name is required'} 
    else if ( lastName.length > 30 ) {newErrors.lastName = 'Last Name is too long'}

    // email errors
    if ( !email || email === '' ) newErrors.email = 'Email is required'
    else if (!email.includes('@')) newErrors.email = 'Invalid email'

    // username errors
    if ( !username || username === '' ) newErrors.username = 'Username is required'
    else if (username.length > 25) newErrors.username = 'Username must be 25 characters or fewer'

    // password errors
    if ( !password || password === '' ) newErrors.password = 'Password is required'
    else if ( password.length < 7 || password.length > 25) newErrors.comment = 'Password must be at least 6 characters and at max 25 characters long'

    return newErrors
  }


  return <Container >
    <h1>Create Account</h1>
    <Container>
      <Form noValidate validated={validated} onSubmit={handleSubmit} >
        <Form.Group className="mb-3" controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control type="string" placeholder="First Name" onChange={handleChange} name="firstName" isInvalid={!!errors.firstName} />
          <Form.Control.Feedback type="invalid">
            {errors.firstName}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control type="string" placeholder="Last Name" onChange={handleChange} name="lastName" isInvalid={!!errors.lastName} />
          <Form.Control.Feedback type="invalid">
            {errors.lastName}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="Enter valid email" onChange={handleChange} name="email" isInvalid={!!errors.email} />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control type="string" placeholder="Enter unique username" onChange={handleChange} name="username"  isInvalid={!!errors.username} />
          <Form.Control.Feedback type="invalid">
            {errors.username}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" onChange={handleChange} name="password" isInvalid={!!errors.password} />
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
        </Form.Group>
        {errors.other}<br/>
        <Button variant="primary" type="submit">
          Sign Up
        </Button>
      </Form>
    </Container>
  </Container>
}

export default SignUpForm