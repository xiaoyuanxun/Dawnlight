import React from 'react';
import {Header} from "./components/header";
import {Content} from "./components/content";
import {UserPage} from "./components/user";
import {Explore} from "./components/explore";

function App() {
  return (
    <div className="App">
      <Header/>
      <Explore/>
    </div>
  );
}

export default App;
