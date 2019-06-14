import React, { useState } from 'react';
import './App.css';
import pdf from './demo.pdf';

function App() {
  const firstname = useFormInput('');
  const lastname = useFormInput('');
  const contactNumber = useFormInput('');
  const emailAddress = useFormInput('');
  
  return (
    <div className="App">
      <div className='online-form-container'>
        <form>
          <Form name={firstname} label='First Name' />
          <Form name={lastname} label='Last Name' />
          <Form name={contactNumber} label='Contact Number' />
          <Form name={emailAddress} label='Email Address' />
        </form>
      </div>
      <div className='scanned-form-container'>
        <embed src={pdf} height='100%' width='100%'  />
      </div>  
    </div>
  );
}

function useFormInput(initialValue) {
  const [ value, setValue ] = useState(initialValue);
  return {
    value,
    onChange: (e) => setValue(e.target.value)
  }
}

function Form({name, label}) {
  return(
    <div>
      <label>{label}: </label>
      <input type='text' name='name' {...name} />
    </div>
  );
}

export default App;
