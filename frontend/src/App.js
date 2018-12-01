import React, { Component } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';

class App extends Component {

  sentText = '';
  lastSentText = '';
  transCode = '';

  constructor(props) {
    super(props);

    this.state = {
      receivedData: '',
      receivedToken: null
    }
  }

  sendData = () => {
    axios.post(`http://localhost:5000/send/`, { sendBox: this.sentText })
      .then(res => {
        this.lastSentText = this.sentText;
        this.setState({ receivedToken: res.data });
        console.log(res);
        console.log(res.data);
      });
  }

  getData = () => {
    this.setState({receivedData: null})
    axios.post(`http://localhost:5000/receive/`, { code: this.transCode })
      .then(res => {
        this.setState({ receivedData: res.data });
        console.log(res.data);

      });
  }

  handleSendText = (event) => {
    this.sentText = event.target.value;
  }

  handleToken = (event) => {
    this.transCode = event.target.value;
  }

  render() {
    return (
      <div className="App container-fluid">
        <h1>Flink</h1>

        <div className="border border-primary p-3">
          <h4>Send Data</h4>
          <div className="form-group">
            <input className="form-control" id="sendText" onKeyPress={(event) => { if (event.key === 'Enter') this.sendData() }} onChange={this.handleSendText} rows="3" />
            <br />
            <button type="button" className="btn btn-primary" onClick={this.sendData}>Generate Code</button>
            {this.state.receivedToken !== null &&
              (
                <div className="text-left m-4">
                  <p><strong>Your token is:</strong> {this.state.receivedToken}</p>
                  <p><strong>Data:</strong> {this.lastSentText}</p>
                </div>
              )
            } 
            {
              this.state.received
            }
          </div>
        </div>

        <div className="border border-primary p-3 mt-3">
          <h4>Receive Data</h4>
          <div className="form-group row">
            <label htmlFor="transCode" className="col-md-2 float-right"><strong>Enter Code</strong></label>
            <input type="text" className="form-control col-md-6" onKeyPress={(event) => { if (event.key === 'Enter') this.getData() }} onChange={this.handleToken} />
            <button className="btn btn-primary ml-1 col-md-2" onClick={this.getData}>Get Data</button>
          </div>

          {this.state.receivedData && (
            <div className="text-left m-3">
              <p><strong>Received Data: </strong>{this.state.receivedData}</p>
            </div>
          )}
          {this.transCode && !this.state.receivedData && <p className="text-left">Loading...</p>}
        </div>
      </div>
    );
  }
}

export default App;
