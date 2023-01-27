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
    <h1>Welcome to PodJot</h1>
    <p>Track your podcast listening with your own notes and ratings!</p>
  </div>
}

export default Home