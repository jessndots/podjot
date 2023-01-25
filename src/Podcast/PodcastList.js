import React, { useContext } from "react";
import UserContext from "../userContext";

function PodcastList() {
  const {user} = useContext(UserContext);
  if (user.username) {
    return (
      <h1>Welcome back, {user.firstName}!</h1>
    )
  }
  return <div>
    <h1>Welcome to Jobly</h1>
  </div>
}

export default PodcastList