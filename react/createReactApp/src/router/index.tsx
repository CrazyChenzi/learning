import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

// Components
import Page1 from '../pages/dashBoard/page1'
import Page2 from '../pages/dashBoard/page2'
import Page3 from '../pages/dashBoard/page3'

const RouterApplication = () => {
  return (
    <Router>
      <Route path="/page1"><Page1></Page1></Route>
      <Route path="/page2"><Page2></Page2></Route>
      <Route path="/page3"><Page3></Page3></Route>
    </Router>
  )
}

export default RouterApplication
