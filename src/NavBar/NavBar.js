import React, { useContext } from "react";
import { NavLink} from "react-router-dom";
import UserContext from "../userContext";
import { Container, Button, NavDropdown, Navbar as Nbar, Nav } from "react-bootstrap";

function NavBar({ logOut }) {
  const { user } = useContext(UserContext);

  return (
    <Nbar bg="light" expand="lg">
      <Container>
        <Nbar.Brand href="/">PodJot</Nbar.Brand>
        <Nav.Link href="/podcasts">Discover</Nav.Link>
        <Nav.Link href="/search">Search</Nav.Link>
        <Nbar.Toggle aria-controls="basic-navbar-nav" />
        <Nbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user.username ? (
              <div>
                <Nav.Link href="/profile">Account</Nav.Link>
                <Button variant="secondary" onClick={logOut}>Log Out</Button>
              </div>
            ): (
              <div>
                <Nav.Link href="/login">Log In</Nav.Link>
                <Nav.Link href="/signup">Sign Up</Nav.Link>
              </div>
            )}

          </Nav>
        </Nbar.Collapse>
      </Container>
    </Nbar >
  )
}


export default NavBar;