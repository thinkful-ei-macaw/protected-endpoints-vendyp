import React, { Component } from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import { Section } from '../../components/Utils/Utils'
import TokenService from '../../services/token-service'
import { Redirect } from 'react-router-dom'
export default class LoginPage extends Component {
  static defaultProps = {
    location: {},
    history: {
      push: () => {},
    },
  }

  handleLoginSuccess = () => {
    const { location, history } = this.props
    const destination = (location.state || {}).from || '/'
    history.push(destination)
  }

  render() {
    console.log('hello world')
    console.log(TokenService.hasAuthToken())
    if(TokenService.hasAuthToken()){
      return <Redirect
      to={{
        pathname: '/',
      }}/>
    }
    
    return (
      <Section className='LoginPage'>
        <h2>Login</h2>
        <LoginForm
          onLoginSuccess={this.handleLoginSuccess}
        />
      </Section>
    )
  }
}
