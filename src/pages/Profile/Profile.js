import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../userContext";
import { Container, Form, Button } from "react-bootstrap";
import podjotApi from "../../api/podjotApi"

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isBeingEdited, setIsBeingEdited] = useState(false);
  const [formData, setFormData] = useState({firstName: user.firstName, lastName: user.lastName, email: user.email, password: user.password})

  // if no user logged in, go to login page
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  // change edit state on click
  const edit = () => {
    setIsBeingEdited(state => !state);
  }


  const handleChange = (evt) => {
    const {name, value} = evt.target;
    setFormData(fData => ({...fData, [name]: value}))
  }

  // on form submit, edit user in db, change user state to reflect changes
  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const u = await podjotApi.editUser(user.username, formData);
    setUser(u);
    setIsBeingEdited(false);
    navigate("/profile")
  }

  
  return (
    <Container className="p-5">
      {isBeingEdited ? (
        <div>
          <h1>Profile</h1 >
          <Form onSubmit={handleSubmit} data-testid="form">
            <p>Username: {user.username} <br/><i>Username can not be changed.</i></p>

            <Form.Label htmlFor="firstName" id="firstName">First Name: </Form.Label>
            <Form.Control type="text" aria-labelledby="firstName" name="firstName" defaultValue={user.firstName} onChange={handleChange}/><br/>

            <Form.Label htmlFor="lastName">Last Name: </Form.Label>
            <Form.Control type="text" name="lastName" defaultValue={user.lastName} onChange={handleChange} /><br/>

            <Form.Label htmlFor="email">Email Address: </Form.Label>
            <Form.Control type="text" name="email" defaultValue={user.email} onChange={handleChange} /><br/>

            <Form.Label htmlFor="password">New Password</Form.Label>
            <Form.Control type="password" name="password" onChange={handleChange} /><br/>

            <Button type="submit">Save Changes</Button>
            <Button onClick={edit}>Cancel Changes</Button>
          </Form>
        </div>
      ): (
        <div>
          <div className="d-flex justify-content-between">
            <h1>Profile</h1 >
            <Button onClick={edit}>Edit</Button>
          </div>
          <p>Username: {user.username}</p>
          <p>First Name: {user.firstName}</p>
          <p>Last Name: {user.lastName}</p>
          <p>Email Address: {user.email}</p>
        </div>)}

    </Container >
  )
}



export default Profile