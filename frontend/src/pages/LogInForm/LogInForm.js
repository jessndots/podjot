import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../userContext";
import { Container, Form, Button } from "react-bootstrap";

function LogInForm({ logIn }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // if user already logged in, go to home page
  useEffect(() => {
    if (user.username) {
      navigate("/")
    }
  }, [user, navigate])

  const INITIAL_STATE = { username: "", password: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(fData => ({ ...fData, [name]: value }))
  }

  // on submit, find errors, submit if none
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setErrors({})
    const newErrors = findFormErrors()
    if ( Object.keys(newErrors).length > 0 ) {
      setErrors(newErrors)
    } else {
      const res = await logIn(formData);
      if (!res.errors) {
        setFormData(INITIAL_STATE);
        navigate("/");
      } else {
        console.log('hi')
        setErrors({other: res.errors})
      }
    } 
    setValidated(true);
  }

  // function to find the form errors
  const findFormErrors = () => {
    const { username, password } = formData
    const newErrors = {}

    // username errors
    if ( !username || username === '' ) newErrors.username = 'Username is required to log in'

    // password errors
    if ( !password || password === '' ) newErrors.password = 'Password is required to log in'
    return newErrors
  }

  return <Container >
    <h1>Log in to PodJot</h1>
    <Container >
      <Form noValidate onSubmit={handleSubmit} >
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Username" 
            name="username" 
            onChange={handleChange} 
            isValid={validated && !errors.username && !errors.other}
            isInvalid={errors.username || errors.other}
            />
          <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password" 
            name="password" 
            onChange={handleChange} 
            isValid={validated && !errors.password && !errors.other}
            isInvalid={errors.password || errors.other}
            />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          <br/><Form.Control.Feedback type="invalid">{errors.other}</Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit">
          Log In
        </Button>
      </Form><br />
      <Link to="/signup">Or create an account</Link>
    </Container>
  </Container>
}

export default LogInForm