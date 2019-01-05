import React, { Component } from 'react';
import axios, { post } from 'axios';
import './App.css';

class App extends Component {
  // url = 'http://localhost:5000/';
  url = 'https://shareflink.herokuapp.com/';
  sentText = '';
  lastSentText = '';
  transCode = '';
  fileNames = {};
  fileToken = '';

  constructor(props) {
    super(props);
    this.state = {
      receivedData: '',
      receivedToken: null,
      file: null,
      fileName: 'Choose file',
      fileGenToken: -1,
      fileRemoved: '',
      fileUpload: '',
      dataValue: 'single_p',
      fileValue: 'single_p',
      usageCounter: 0
    }
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFileSet = this.onFileSet.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.getFileData = this.getFileData.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.handleDataChange = this.handleDataChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);

  }

  handleDataChange(event) {
    this.setState({dataValue: event.target.value});
  }

  handleFileChange(event) {
    this.setState({fileValue: event.target.value});
  }

  sendData = () => {
    axios.post(this.url+'send/', { sendBox: this.sentText, selectOption: this.state.dataValue })
      .then(res => {
        this.lastSentText = this.sentText;
        this.setState({ receivedToken: res.data });
      });
  }

  removeFile = () => {
    axios({
      method: 'post',
      url: this.url+'remove/',
      data: { removeFileName: this.fileToken.toString() }
    })
      .then((res) => { this.setState({ fileRemoved: res.data }) })
  }

  getData = () => {
    this.setState({ receivedData: null })
    axios.post(this.url+'receive/', { code: this.transCode })
      .then(res => {
        this.setState({ receivedData: res.data });
      });
  }

  getFileData = () => {
    
    if (!!this.state.fileRemoved) this.setState({fileRemoved: ''});
    
    const data = new FormData();
    data.append('fileToken', this.fileToken);
    axios({
      method: 'post',
      url: this.url+'download/',
      responseType: 'arraybuffer',
      headers: {
        'content-type': 'multipart/form-data'
      },
      data: data
    })
      .then(res => {
        if (res.status === 200){
          let filename = res.headers['x-filename'];
          let fileType = res.headers['content-type'];
          let blob = new Blob([res.data], { type: fileType })
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.setAttribute('download', filename); //or any other extension
          document.body.appendChild(link);
          link.click();
        }
        else {
          this.setState({
            fileRemoved:'No file available for the given code!'
          });
        }
      });
  }

  handleSendText = (event) => {
    this.sentText = event.target.value;
  }

  handleToken = (event) => {
    this.transCode = event.target.value;
  }

  handleFileToken = (event) => {
    this.fileToken = event.target.value;
  }

  onFormSubmit(e) {
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response) => {
      this.setState({ fileGenToken: response.data, fileUpload: 'File has been uploaded successfully!' });
    })
  }
  onFileSet(e) {
    this.setState({ file: e.target.files[0], fileName: e.target.files[0].name })
  }

  fileUpload(file) {
    this.setState({ fileName: 'Choose file', fileRemoved: '' });
    const url = this.url+'upload/';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('selectOption', this.state.fileValue);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return post(url, formData, config)
  }

  render() {
    return (
      <div className="App container-fluid">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9av7xaqErKn1QHapIsRex5v_oH6miboRJjZwtrsPIodC7EqUq" alt="Italian Trulli" style={{ width: '20%', marginTop: '5%' }}></img>
        <div className="border border-primary p-3 mt-3 container">
          <h4>Store Data</h4>
          <div className="form-group row">
            <label htmlFor="transCode" className="col-md-2 float-right"><strong>Enter Text</strong></label>
            <input type="text" className="form-control col-md-6" id="sendText" onKeyPress={(event) => { if (event.key === 'Enter') this.sendData() }} onChange={this.handleSendText} />
            <button className="btn btn-primary ml-1 col-md-2" onClick={this.sendData}>Generate Code</button>
            <select className="form-control select-text-tag" value={this.state.dataValue} onChange={this.handleDataChange}>
                <option defaultValue='single_p'>Single Retrieval-Public</option>
                <option value='multi_p'>Multi Retrieval-Public</option>
                <option value='single_s'>Single Retrieval-Secured</option>
                <option value='multi_s'>Multi Retrieval-Secured</option>
            </select>
          </div>
          {this.state.receivedToken !== null &&
            (
              <div className="text-left m-4">
                <p style={{ 'textAlign': 'center' }}><strong>Your token is:</strong> {this.state.receivedToken}</p>
              </div>
            )
          }
          {
            this.state.received
          }
        </div>
        <div className="border border-primary p-3 mt-3 container">
          <h4>File Upload</h4>
          <div className="form-group row">
            <form onSubmit={this.onFormSubmit} className="form-center">
              <p>Custom file:</p>
              <div className="custom-file mb-3">
                <input type="file" className="custom-file-input mb-1" id="customFile" name="filename" onChange={this.onFileSet} />
                <label className="custom-file-label" htmlFor="customFile">{this.state.fileName}</label>
              </div>
              <button className="btn btn-primary  custom_button" type="submit" onClick={() => { }} >Upload</button>
              <select className="form-control select-file-tag" value={this.state.fileValue} onChange={this.handleFileChange}>
                <option defaultValue='single_p'>Single Retrieval-Public</option>
                <option value='multi_p'>Multi Retrieval-Public</option>
                <option value='single_s'>Single Retrieval-Secured</option>
                <option value='multi_s'>Multi Retrieval-Secured</option>
              </select>
            </form>
          </div>
          { !!this.state.fileUpload &&
            (<p><strong>{this.state.fileUpload}</strong></p>)
          }
          { this.state.fileGenToken>=0 &&
            (<p><strong>Your file download token:</strong> {this.state.fileGenToken}</p>)
          }
        </div>

        <div className="border border-primary p-3 mt-3 container">
          <h4>Retrieve Text</h4>
          <div className="form-group row">
            <label htmlFor="transCode" className="col-md-2 float-right"><strong>Enter Code</strong></label>
            <input type="text" className="form-control col-md-6" onKeyPress={(event) => { if (event.key === 'Enter') this.getData() }} onChange={this.handleToken} />
            <button className="btn btn-primary ml-1 col-md-2" onClick={this.getData}>Get Data</button>
          </div>

          {this.state.receivedData && (
            <div className="text-left m-3">
              <p style={{ 'textAlign': 'center' }}><strong>Received Data: </strong>{this.state.receivedData}</p>
            </div>
          )}
          {this.transCode && !this.state.receivedData && <p style={{ 'textAlign': 'center' }}>Loading...</p>}
        </div>

        <div className="border border-primary p-3 mt-3 container">
          <h4>Retrieve or Remove File</h4>
          <div className="form-group row">
            <label htmlFor="transCode" className="col-md-2 float-right"><strong>Enter Code</strong></label>
            <input type="text" className="form-control col-md-6" onKeyPress={(event) => { if (event.key === 'Enter') this.getData() }} onChange={this.handleFileToken} />
            <button className="btn btn-primary ml-1 col-md-1" onClick={this.getFileData}>Get File</button>
            <button className="btn btn-secondary ml-1 col-md-2" onClick={this.removeFile}>Delete File</button>
          </div>
          {this.state.fileRemoved && (
            <div className="text-left m-3">
              <p style={{ 'textAlign': 'center' }}><strong>{this.state.fileRemoved}</strong></p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
