
import React, { useEffect, useState } from "react";
import App from "./App";
import podjotApi from "./api/podjotApi";
import useLocalStorage from "./helpers/useLocalStorage";
import parseJWT from "./helpers/parseJWT";

const UserContext = React.createContext();

function UserProvider() {

  const [token, setToken] = useState("");
  const [user, setUser] = useState({});
  let tokenInLS, setTokenInLS
  [tokenInLS, setTokenInLS] = useLocalStorage(tokenInLS, "")

  useEffect(() => {
    // on start, set token to whatever is in LS
    if (tokenInLS && !user.username) {
      setToken(tokenInLS);
    } 
  // eslint-disable-next-line
  }, [])

  useEffect(() => {
    // on token change, if no user, set user and update token in LS
    if (token && !user.username) {
      podjotApi.token = token;
      setTokenInLS(token);
      async function fetchUser(t) {
        const { username } = parseJWT(t);
        const u = await podjotApi.getUser(username);
        setUser(u);
      }
      fetchUser(token);
    // if user and empty token, complete logout by clearing LS and user context
    } else if (!token && user.username) {
      console.log("UserContext - setting user to blank object")
      setUser({});
      setTokenInLS("")
    }
  // eslint-disable-next-line
  }, [token])


  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      <App />
    </UserContext.Provider>
  )
}

export default UserContext
export {UserProvider}