import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

const GITHUB_CLIENT_ID = "b300d5a7a3f9dc006d48";
const gitHubRedirectURL = "http://localhost:3001/api/auth/github";
const path = "/";
const API_URL = "http://localhost:3001";

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const res = await axios.get(`${API_URL}/api/me`, { withCredentials: true });
    setUser(res.data);
  };

  return (
    <div className="App">
      {!user ? (
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email`}
        >
          LOGIN WITH GITHUB
        </a>
      ) : (
        <h1>Welcome {user.login}</h1>
      )}
    </div>
  );
}

export default App;
