import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';
import TestComp from 'common/components/TestComp';
import axios from 'axios';
import { Button } from 'antd';

const Popup = () => {
  const [text, setText] = React.useState('test');

  const clickHandler = () => {
    axios.get('http://localhost:4000/api/user')
        .then(res => {
          console.log(res)
          setText(res.data?.name);
        }, err => {})
        .catch(function(error){
          if(error.response){
            //请求已经发出，但是服务器响应返回的状态吗不在2xx的范围内,可根据不同错误码进行错误处理
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.header);
          }else {
            //一些错误是在设置请求的时候触发
            console.log('Error',error.message);
          }
          console.log(error.config);
        });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/pages/Popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <TestComp />
        <Button onClick={clickHandler}>{text}</Button>
      </header>
    </div>
  );
};

export default Popup;
