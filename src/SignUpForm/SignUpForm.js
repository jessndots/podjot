import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function SignUpForm({ signUp, error }) {
  const INITIAL_STATE = { firstName: "", lastName: "", email: "", username: "", password: "" };
  const [formData, setFormData] = useState(INITIAL_STATE);
  const history = useHistory();
  const [isIncomplete, setIsIncomplete] = useState(false);

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData(fData => ({ ...fData, [name]: value }))
  }

  const handleSubmit = (evt) => {
    try {
      async function handle(e) {
        evt.preventDefault();
        if (Object.values(formData).every(val => val !== "")) {
          const res = await signUp(formData);
          if (res) {
            setIsIncomplete(false);
            setFormData(INITIAL_STATE);
            history.push("/");
          }
        } else {
          setIsIncomplete(true)
        }
      }
      return handle(evt);
    } catch (err) {
      throw err
    }

  }

  const errs = error.map(err => <p key="err">{err}</p>)
  
  return <div>
    <h1>Create Account</h1>
    <form onSubmit={handleSubmit} data-testid="form">

      <label htmlFor="firstName">First Name</label>
      <input name="firstName" id="firstName" type="text" onChange={handleChange}></input><br />

      <label htmlFor="lastName">Last Name</label>
      <input name="lastName" id="lastName" type="text" onChange={handleChange}></input><br />

      <label htmlFor="email">Email Address</label>
      <input name="email" id="email" type="text" onChange={handleChange}></input><br />

      <label htmlFor="username">Username</label>
      <input name="username" id="username" type="text" onChange={handleChange}></input><br />

      <label htmlFor="password">Password</label>
      <input name="password" id="password" type="password" onChange={handleChange}></input><br />

      {isIncomplete ? <p>All fields are required</p> : null}
      {error ? [errs] : null}

      <button type="submit">Sign Up</button>
    </form>
  </div>
}

export default SignUpForm