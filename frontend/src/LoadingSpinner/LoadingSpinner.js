import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = (props) => {
    let { loadingText, isBlur, isFinishing } = props;
    return <div className={`loading-spinner ${isBlur?'blur':''} ${isFinishing?'finishing':''}`}>
        <div className= {`loader ${isBlur?'blurredLoader':''}`}><i className="fa fa-spinner fa-spin" /> {loadingText}...</div>
    </div>;
}

export default LoadingSpinner;