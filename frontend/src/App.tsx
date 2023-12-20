import React from 'react';
import {Header} from "./components/header";
import {Content} from "./components/content";
import {UserPage} from "./components/user";

function App() {
  return (
    <div className="App">
      <Header/>
      <UserPage/>
    </div>
  );
}

export default App;
