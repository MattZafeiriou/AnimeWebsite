import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Footer from './Components/Footer.js'
import Home from './Components/MainP.js';
import About from './Components/About/About.js';
import Player from './Components/Player/Player.js';
import NotFound from './Components/NotFound.js';
import Contact from './Components/Contact/Contact.js';
import Header from './Components/Header.js'
import Headerr from './Components/Headerr.js'
import SubmitSuccess from './Components/Submit_Success/Submit_success.js'

const Main = () => {
  return (
    <Switch> {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path='/' component={Home}>
        <Header/>
        <Home/>
        <Footer/>
      </Route>
      <Route exact path='/about' component={About}>
        <Headerr/>
        <About/>
        <Footer/>
      </Route>
      <Route exact path='/submit_success' component={SubmitSuccess}>
        <Headerr/>
        <SubmitSuccess/>
        <Footer/>
      </Route>
      <Route exact path='/p/*' component={Player}>
        <Headerr/>
        <Player/>
        <Footer/>
      </Route>
      <Route exact path='/contact' component={Contact}>
        <Headerr/>
        <Contact/>
        <Footer/>
      </Route>
      <Route path='*' component={NotFound}>
        <NotFound/>
      </Route>
    </Switch>
  );
}

export default Main;