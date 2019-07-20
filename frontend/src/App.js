import React, { useState, useEffect } from 'react';
import './App.css';
import FileUploader from './FileUploader/FileUploader';
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';

function App() {

  const [fileStatus, setFileStatus] = useState(1);
  const [fileData, setFileData] = useState({})
  const [image, setImage] = useState({});
  const [pageDetails, setPageDetails] = useState({page:1});
  const [coordsList, setCoordsList] = useState([]);
  const [coords, setCoords] = useState([]);
  const [loadingText, setLoadingText] = useState('Submitting the scanned form');
  const [isBlur, setIsBlur] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [highlights, setHighlights] = useState([]);

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
    if (fileStatus === 2) {
      setLoadingText('Submitting the scanned form')
      setIsBlur(false);
      setImage({});
      setCoordsList([]);
      setCoords([]);
      setIsFinishing(false);
      let url = 'http://127.0.0.1:5000/';
      fetch(url,{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({...fileData})
      })
      .then((response)=> {
        response.json()
        .then((response) => {
          let { base64_string, width, height, page, page_count } = response;
          setImage({base64_string, width, height})
          setPageDetails({page: parseInt(page), page_count})
          setLoadingText('Analyzing');
          setTimeout(() => {
            setLoadingText('Finishing up');
            setTimeout(() => {
              setLoadingText('Almost There');  
            }, 10000)
            setIsFinishing(true);
          }, 8000)
          setFileStatus(3);
          setIsBlur(true);
          fetch('http://127.0.0.1:5000/ack')
          .then(() => {
            setIsBlur(false);
          })
        })
      })
    }
  }, [fileStatus, fileData])

  useEffect(() => {
    //Function to find highlight box coordinates
    const getHighlightCoordinates = ([x1, y1, x2, y2]) => {
      const { width:fileWidth, height:fileHeight } = image;

      // file coordinates in percent 
      const percentCoordinates = [x1 * 100 / fileWidth-1 , y1 * 100 / fileHeight-1];

      //width and height of viewport file
      const { width: actual_width, height: actual_height } = document.querySelector(".embed")
        .getBoundingClientRect();

      //highlight box width and height
      const hightlightCoordinates = [(x2-x1)*100/(3 * actual_width), (y2-y1)*100/actual_height];

      let result = [...percentCoordinates, ...hightlightCoordinates]
      return result.map((item) => {
        return item + '%'
      });
    }

    setHighlights(coords.map((coord, ind) => {
      let per = getHighlightCoordinates([...coord])
      return <div key={ind} className="highlight" style={{top:per[1], left:per[0], width:per[2], height:per[3]}} />;
    }))
  }, [coords, image])

  useEffect(() => {
    if(coordsList.length !== 0) {
      let coordObj = coordsList.filter((coord) => {
        return Object.values(coord)[0].length !== 0
      })[0]
      if(!coordObj) {
        coordObj = coordsList[0];
      }
      const page = parseInt(Object.keys(coordObj)[0]);
      const coordinates = Object.values(coordObj)[0];
      const { fileName } = fileData;
      let url = `http://127.0.0.1:5000/getpage`
      fetch(url,{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileName, page})
      })
      .then((response) => response.json())
      .then((data) => {
        let { base64_string, width, height } = data;
        setImage(i => ({...i, base64_string, width, height }));
        setPageDetails(i => ({...i, page}));
        setCoords(coordinates);
      })
    }
  }, [coordsList])

  function getPage(page) {
    const { fileName } = fileData;
    setPageDetails({...pageDetails, page})
    let url = `http://127.0.0.1:5000/getpage`
    fetch(url,{
      method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({fileName, page})
    })
    .then((response) => response.json())
    .then((data) => {
      let { base64_string, width, height } = data;
      setImage(i => ({...i, base64_string, width, height }));
      if(coordsList.length!==0) {
        const updatedCoord = coordsList.filter((coord) => {
          return parseInt(Object.keys(coord)[0])===page
        })[0][page]
        setCoords(updatedCoord);
      }
    }) 
  }

  function handleFileChange(status, data) {
    setFileStatus(status);
    setFileData({ ...data });
  }

  function handleFocus(coordsData) {
    setCoordsList(coordsData);
  }

  function handleNextClick() {
    getPage(parseInt(pageDetails.page)+1)
  }

  function handlePreviousClick() {
    getPage(parseInt(pageDetails.page)-1)
  }

  if (fileStatus === 1) {
    return (
      <FileUploader handleChange={handleFileChange} fileStatus={fileStatus} />
    );
  } else if (fileStatus === 2) {
    return (
      <LoadingSpinner loadingText={loadingText}/>
    )
  } else {
    return (
      <div className="App">
        {isBlur?<LoadingSpinner loadingText={loadingText} isBlur={true} isFinishing={isFinishing}/>:null}
        <div className='online-form-container'>
          <div className='back'>
            <FileUploader handleChange={handleFileChange} fileStatus={fileStatus} />
          </div>
          <span className='filename'>{fileData.fileName}</span>
          <h2 className='header'>Online Form</h2>
          <form>
            <div className='section-name'>Personal Details</div>
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposed_name} label='Name' id='proposed-name' />
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposed_age} label='Age' id='proposed-age' />
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposed_dob} label='Date Of Birth' id='proposed-dob' />
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposed_nationality} label='Nationality' id='proposed-nationality' />

            <div className='section-name'>Proposer</div>
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposer_name} label='Name' id='proposer-name' />
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={proposer_age} label='Age' id='proposer-age' />

            <div className='section-name'>Family Details</div>
            <RadioForm setCoordinates={(array) => handleFocus(array)} valueObject={family_marital} label='Marital Status' id='family-marital' />

            <div className='section-name'>Address</div>
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={address_pincode} label='Pin Code' id='address-pincode' />
            <Form setCoordinates={(array) => handleFocus(array)} valueObject={address_emailAddress} label='E-mail' id='address-email' />
          </form>
        </div>
        <div className='scanned-form-container'>
          {!(pageDetails.page===1)?<div className='control prevButton' onClick={handlePreviousClick}><i className='fa fa-angle-left'></i></div>:null}
          {!(pageDetails.page===pageDetails.page_count)?<div className='control nextButton' onClick={handleNextClick}><i className='fa fa-angle-right'></i></div>:null}
          <div className='pageLabel'>Page {pageDetails.page} of {pageDetails.page_count}</div>
          <embed className='embed' src={`data:image/jpg;base64,${image.base64_string}`}/>
          {highlights}
        </div>
      </div>
    );
  }
}

//Custom Hook for input
function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  return {
    value,
    onChange: (e) => {
      setValue(e.target.value)
    }
  }
}

//Form Component
function Form({ setCoordinates,valueObject, label, id }) {
  let type = ''
  switch (label) {
    case 'Date Of Birth':
      type = 'date';
      break;
    default:
      type = 'text';
  }

  async function handleFocus() {
    const data = await getHighlightCoords(label);
    setCoordinates(data.coords);  
  }

  return (
    <div className='input-container'>
      <div></div>
      <label className='label'>{label}: </label>
      <input id={id} className='input' type={type} {...valueObject} onFocus={handleFocus} />
    </div>
  );
}

//Radio Form Component
function RadioForm({ setCoordinates, valueObject, label, id }) {

  async function handleFocus() {
    const data = await getHighlightCoords(label);
    setCoordinates(data.coords); 
  }

  const onChangeHandle = (e) => {
    valueObject.onChange(e);
    handleFocus(); 
  }

  return (
    <div className='input-container'>
      <div></div>
      <label className='label'>{label}: </label>
      <div className='input'>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={onChangeHandle} value='Single' /> Single</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={onChangeHandle} value='Married' /> Married</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={onChangeHandle} value='Divorced' /> Divorced</span>
        <span className='radio-input'><input id={id} type='radio' name='marital' onChange={onChangeHandle} value='Widowed' /> Widowed</span>
      </div>
    </div>
  );
}

async function getHighlightCoords(label) {
  let url = `http://127.0.0.1:5000/highlight/${label.toLowerCase()}`
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

export default App;