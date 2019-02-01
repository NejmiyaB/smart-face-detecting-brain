import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import 'tachyons';

import './App.css';

const particlesOptions = {
    particles: {
      number:{
        value:30,
        density:{
          enable:true,
          value_area:800

        }
      }
    }
  }
      


 const initialstate = {
      input: '',
      imageUrl:'',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: new Date()

      }
    }
  
// const app =  new Clarifai.App({
//   apiKey:'c3aa6b0ccb3f4526856c775da01f0510'
// });

 
class App extends Component {

  constructor() {
    super();
    this.state = initialstate;
      }

  loadUser = (data) =>{
this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
}});
  
}
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height-(clarifaiFace.bottom_row * height)

    }
// console.log(width, height);

  }
  displayFaceBox = (box) => {
    
    this.setState({box:box});
      }
  onInputChange = (event) => {
this.setState({input:event.target.value});
//console.log(event.target.value)
  }
  onButtonSubmit = () => {
    this.setState({imageUrl:this.state.input});
     fetch('https://stormy-fjord-78245.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
           })
      })

     .then(response => response.json())
   // fetch(this.state.input).then(
    //app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    // we take the response and then calculate face location and then display the box
    .then(response => {
      if (response){
      fetch('https://stormy-fjord-78245.herokuapp.com/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
           })
      })

      .then(response => response.json())
      //count is updated
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries:count}))
          })
      .catch(console.log)
       } 
     this.displayFaceBox(this.calculateFaceLocation(response))
     
     })
    .catch(err => console.log(err));
     
}

    
    onRouteChange = (route) => {
    
    if(route === 'signout'){
      this.setState(initialstate)
    }
    else if(route === 'home'){
      this.setState({isSignedIn:true})
    }
      this.setState({route:route})
  }
  render(){
   const  { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles" //to keep particles.js below everything
         params={particlesOptions}
                
              />
          <Navigation  isSignedIn = {isSignedIn} onRouteChange= {this.onRouteChange} />
          {route ===  'home' ?
              <div>
                  <Logo/>
                  <Rank name={this.state.user.name} 
                        entries= {this.state.user.entries} />
                  <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit} />
                  <FaceRecognition box={box} imageUrl={imageUrl}/>
                 
                </div>
          : (
           route === 'signin' ?
            
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
          

          }
        
      </div>
      );
    }
  }

export default App;