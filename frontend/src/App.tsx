import React from 'react';
import {Header} from "./components/header";
import {Home} from "./components/content";
import {UserPage} from "./components/user";
import {Explore} from "./components/explore";
import {Routes, Route} from "react-router-dom";
import {Assets} from "./components/assets";
import {Editor} from "./components/editor";

function App() {
  return (
    <div className="App">
      <Header/>
      <Routes>
        <Route path={"/"} element={<Home/>}/>
        <Route path={"explore"} element={<Explore/>}/>
        <Route path={"address/:address"} element={<UserPage/>}/>
        <Route path={"top"} element={<Assets/>}/>
        <Route path={"editor"} element={<Editor/>}/>
      </Routes>
    </div>
  );
}

export default App;
