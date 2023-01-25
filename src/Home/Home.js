import React, { useContext } from "react";
import UserContext from "../userContext";

function Home() {
  const {user} = useContext(UserContext);
  if (user.username) {
    return (
      <h1>Welcome back, {user.firstName}!</h1>
    )
  }
  return <div>
    <h1>Welcome to Jobly</h1>
    <p>Search and apply for positions at companies around the world!</p>
  </div>
}

export default Home