import React from 'react';
import {Header} from "./components/header";
import {Content} from "./components/content";
import {UserPage} from "./components/user";
import {Explore} from "./components/explore";
import {Routes, Route} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Header/>
      <Routes>
        <Route path={"/"} element={<Content/>}/>
        <Route path={"explore"} element={<Explore/>}/>
        <Route path={"address/:address"} element={<UserPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
