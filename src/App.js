import React, { useState } from 'react';
import './App.css';
import pdf from './demo.pdf';
import FileUploader from './FileUploader/FileUploader';
import LoadingSpinner from './LoadingSpinner';

function App() {

  const [ fileStatus, setFileStatus ] = useState(1);
  const [ fileData, setFileData ] = useState({
    fileBase64: '',
    type:''
  })

  const proposed_name = useFormInput('');
  const proposed_nationality = useFormInput('');
  const proposed_age = useFormInput('');
  const proposed_emailAddress = useFormInput('');
  const proposer_name = useFormInput('');
  const proposer_age = useFormInput('');

  function handleFileChange(fileStatus, fileData) {
    setFileStatus(fileStatus);
    setFileData(fileData);
  }

  if(fileStatus===1) {
    return(
      <FileUploader handleChange={handleFileChange}/>
    );  
  } else if(fileStatus===2) {
    return(
      <LoadingSpinner />
    )
  } else{
    return (
      <div className="App">
        <div className='online-form-container'>
          <hr/>
          <h2 className='header'>Online Form</h2>
          <hr/>
          <form>
            <div className='section-name'>Proposed/Insured</div>
            <Form valueObject={proposed_name} label='Name' id='proposed-name' />
            <Form valueObject={proposed_age} label='Age' id='proposed-age' />
            <Form valueObject={proposed_emailAddress} label='Email Address' id='proposed-email' />
            <Form valueObject={proposed_nationality} label='Nationality' id='proposed-nationality' />
  
            <div className='section-name'>Proposer</div>
            <Form valueObject={proposer_name} label='Name' id='proposer-name' />
            <Form valueObject={proposer_age} label='Age' id='proposer-age' />
          </form>
        </div>
        <div className='scanned-form-container'>
          <embed src={pdf} height='100%' width='100%' />
        </div>
      </div>
    );
  }
}

function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  return {
    value,
    onChange: (e) => {
      setValue(e.target.value)
    }
  }
}

function Form({valueObject, label}) {
  return(
    <div className='input-conatiner'>
      <div></div>
      <label className='label'>{label} </label>
      <input className='input' type='text' {...valueObject} />
      <div></div>
    </div>
  );
}

export default App;
