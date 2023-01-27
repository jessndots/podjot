import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../userContext";
import { Container, Form, Button } from "react-bootstrap";

function LogInForm({ logIn }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();


  useEffect(() => {
    if (user.username) {
      navigate("/")
    }
  }, [user, navigate])

  const INITIAL_STATE = { username: "", password: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [validated, setValidated] = useState();
  const [errors, setErrors] = useState({});

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(fData => ({ ...fData, [name]: value }))
  }

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      setErrors({})
      const newErrors = findFormErrors()
      if ( Object.keys(newErrors).length > 0 ) {
        setErrors(newErrors)
        setValidated(false);
      } else {
        const res = await logIn(formData);
        if (!res.errors) {
          setValidated(true);
          setFormData(INITIAL_STATE);
          navigate("/");
        } else {
          setErrors({other: res.errors})
        }
      } 
    } catch(err) {
      return
    }
  }

  const findFormErrors = () => {
    const { username, password } = formData
    const newErrors = {}

    // username errors
    if ( !username || username === '' ) newErrors.username = 'Username is required to log in'

    // password errors
    if ( !password || password === '' ) newErrors.password = 'Password is required to log in'

    return newErrors
  }

  return <Container fluid>
    <h1>Log in to PodJot</h1>
    <Container fluid>
      <Form noValidate validated={validated} onSubmit={handleSubmit} >
        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control type="email" placeholder="Username" name="username" onChange={handleChange} isInvalid={!formData.username} />
          <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" name="password" onChange={handleChange} isInvalid={!formData.password}/>
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
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