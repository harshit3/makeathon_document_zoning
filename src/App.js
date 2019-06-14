import React, { useState, useEffect } from 'react';
import './App.css';
import pdf from './demo.pdf';
import FileUploader from './FileUploader/FileUploader';
import LoadingSpinner from './LoadingSpinner';

function App() {

  const [ fileStatus, setFileStatus ] = useState(1);
  const [ fileData, setFileData ] = useState({})

  const proposed_name = useFormInput('');
  const proposed_nationality = useFormInput('');
  const proposed_age = useFormInput('');
  const proposed_dob = useFormInput('');

  const proposer_name = useFormInput('');
  const proposer_age = useFormInput('');

  const family_marital = useFormInput('');
  
  const address_pincode = useFormInput('');
  const address_emailAddress = useFormInput('');

  useEffect(() => {
    if(fileStatus===2) {
      setTimeout(() => {
        setFileStatus(3)
      }, 2000)
    }
  }, [fileStatus, fileData])

  function handleFileChange(status, data) {
    setFileStatus(status);
    setFileData({...data});
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
          <span className='back' onClick={() => {
            setFileStatus(1)
            setFileData({})
            }}
          >
            Upload Again
          </span>
          <span className='filename' onClick={() => setFileStatus(1)}>{fileData.fileName}</span>
          <h2 className='header'>Online Form</h2>
          <hr/>
          <form>
            <div className='section-name'>Personal Details</div>
            <Form valueObject={proposed_name} label='Name' id='proposed-name' />
            <Form valueObject={proposed_age} label='Age' id='proposed-age' />
            <Form valueObject={proposed_dob} label='Date Of Birth' id='proposed-dob' />
            <Form valueObject={proposed_nationality} label='Nationality' id='proposed-nationality' />
  
            <div className='section-name'>Proposer</div>
            <Form valueObject={proposer_name} label='Name' id='proposer-name' />
            <Form valueObject={proposer_age} label='Age' id='proposer-age' />

            <div className='section-name'>Family Details</div>
            <RadioForm valueObject={family_marital} label='Marital Status' id='family-marital' />

            <div className='section-name'>Address</div>
            <Form valueObject={address_pincode} label='Pin Code' id='address-pincode' />
            <Form valueObject={address_emailAddress} label='E-mail Address' id='address-email' />
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

function Form({valueObject, label, id}) {
  let type = ''
  switch(label) {
    case 'Date Of Birth':
      type='date';
      break;
    default:
      type='text'; 
  }

  return(
    <div className='input-container'>
      <div></div>
      <label className='label'>{label} </label>
      <input id={id} className='input' type={type} {...valueObject} />
    </div>
  );
}

function RadioForm({valueObject, label, id}) {
  return(
    <div className='input-container'>
      <div></div>
      <label className='label'>{label} </label>
      <div className='input'>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={valueObject.onChange} value='Single' /> Single</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={valueObject.onChange} value='Married' /> Married</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={valueObject.onChange} value='Divorced' /> Divorced</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={valueObject.onChange} value='Widowed' /> Widowed</span>
      </div>
    </div>
  );
}

export default App;
