import React, {useEffect} from 'react';
import {Header} from "./components/header";
import {Home} from "./components/content";
import {Holding, MyContents, UserPage} from "./components/user";
import {Explore} from "./components/explore";
import {Routes, Route} from "react-router-dom";
import {Assets} from "./components/assets";
import {Editor} from "./components/editor";
import {bodhiApi} from "./api/bodhi";

function App() {
  //
  // useEffect(() => {
  //   bodhiApi.getAssetsEntries().then(e => {
  //     console.log(e)
  //   })
  // }, [])

  return (
    <div className="App">
      <Header/>
      <Routes>
        <Route path={"/"} element={<Home/>}/>
        <Route path={"/:id"} element={<Home/>}/>
        <Route path={"explore"} element={<Explore/>}/>
        <Route path={"user"} element={<UserPage/>}>
          <Route path={"contents/:address"} element={<MyContents/>}/>
          <Route path={"holdings/:address"} element={<Holding/>}/>
        </Route>
        {/*<Route path={"top"} element={<Assets/>}/>*/}
        <Route path={"editor"} element={<Editor/>}/>
        <Route path={"assets"} element={<Assets/>}/>
      </Routes>
    </div>
  );
}

export default App;
