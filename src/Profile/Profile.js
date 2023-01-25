import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import UserContext from "../userContext";

function Profile({ editProfile }) {
  const { user } = useContext(UserContext);
  const history = useHistory();
  const [isBeingEdited, setIsBeingEdited] = useState(false);
  const [oldUsername, setOldUsername] = useState("")
  const [formData, setFormData] = useState({firstName: user.firstName, lastName: user.lastName, email: user.email, password: user.password})

  useEffect(() => {
    if (!user.username) {
      history.push("/login")
    }
  }, [user, history])


  const edit = () => {
    setIsBeingEdited(state => !state);
  }

  const handleChange = (evt) => {
    setOldUsername(user.username)
    const {name, value} = evt.target;
    setFormData(fData => ({...fData, [name]: value}))
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    editProfile(oldUsername, formData);
    setIsBeingEdited(false);
    history.push("/profile")
  }

  
  return (
    <div>
      {isBeingEdited ? (
        <div>
          <h1>Profile</h1 >
          <form onSubmit={handleSubmit} data-testid="form">
            <p>Username: {user.username} <br/><i>Username can not be changed.</i></p>

            <label htmlFor="firstName" id="firstName">First Name: </label>
            <input type="text" aria-labelledby="firstName" name="firstName" defaultValue={user.firstName} onChange={handleChange}></input><br/>

            <label htmlFor="lastName">Last Name: </label>
            <input type="text" name="lastName" defaultValue={user.lastName} onChange={handleChange}></input><br/>

            <label htmlFor="email">Email Address: </label>
            <input type="text" name="email" defaultValue={user.email} onChange={handleChange}></input><br/>

            <label htmlFor="password">New Password</label>
            <input type="password" name="password" onChange={handleChange}></input><br/>

            <button type="submit">Save Changes</button>
            <button onClick={edit}>Cancel Changes</button>
          </form>
        </div>
      ): (
        <div>
          <h1>Profile<button onClick={edit}>Edit</button></h1 >
          <p>Username: {user.username}</p>
          <p>First Name: {user.firstName}</p>
          <p>Last Name: {user.lastName}</p>
          <p>Email Address: {user.email}</p>
        </div>)}

    </div >
  )
}



export default Profile