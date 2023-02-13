import React, { useContext, useState } from "react";
import { NavLink, useNavigate, createSearchParams} from "react-router-dom";
import UserContext from "../userContext";
import { Container, Button, NavDropdown, Navbar as Nbar, Nav, Form } from "react-bootstrap";


function NavBar({ logOut, search }) {
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({q: ""});

  const navigate = useNavigate();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(fData => ({ ...fData, [name]: value }))
  }

  const handleSubmit = async (evt) => {
    try {
      evt.preventDefault();
      navigate({pathname: '/search', search: `?${createSearchParams({...formData, type: 'episode'})}`});
    } catch(err) {
      return
    }
  }



  return (
    <Nbar bg="light" expand="lg">
      <Container>
        <Nbar.Brand href="/">PodJot</Nbar.Brand>
        <Form onSubmit={handleSubmit} className="d-flex ">
          <Form.Control name="q" placeholder="Search PodJot" onChange={handleChange}></Form.Control> 
          <Button type="submit"><i className="bi bi-search"></i></Button>
        </Form>
        {user.username ? (
          <>
            <Nav.Link href="/profile">Account</Nav.Link>
            <Button variant="secondary" onClick={logOut}>Log Out</Button>
          </>
        ): (
          <>
            <Nav.Link href="/login">Log In</Nav.Link>
            <Nav.Link href="/signup">Sign Up</Nav.Link>
          </>
        )}

      </Container>
    </Nbar >
  )
}


export default NavBar;