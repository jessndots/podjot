import React, { useContext, useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import UserContext from "../userContext";

function LogInForm({logIn}) {
  const {user} = useContext(UserContext);
  const history = useHistory();
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (user.username) {
      history.push("/")
    }
  }, [user, history])

  const INITIAL_STATE= {username: "", password: ""};
  const [formData, setFormData] = useState(INITIAL_STATE);

  const handleChange = (evt) => {
    const {name, value} = evt.target;
    setFormData(fData => ({...fData, [name]: value}))
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const res = await logIn(formData);
      if(res.token) {
        setFormData(INITIAL_STATE);
        history.push("/");
      }
    } catch(err) {
      setIsInvalid(true);
      return
    }

  }

  return <div>
    <h1>Log in to Jobly</h1>
    <form onSubmit={handleSubmit} data-testid="form">
      <label htmlFor="username">Username</label>
      <input name="username" id="username" type="text" onChange={handleChange}></input><br/>
      <label htmlFor="password">Password</label>
      <input name="password" id="password" type="password" onChange={handleChange}></input><br/>
      <button type="submit">Log in</button>
    </form>
    {isInvalid? (<p><i>Incorrect username or password.</i></p>): null}
    <Link to="/signup">Or create an account</Link>
  </div>
}

export default LogInForm