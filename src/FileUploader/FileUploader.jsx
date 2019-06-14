import React, { useState, useEffect } from 'react';
import './css/FileUploader.css';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function FileUploader(props) {

    const [rawBase64, setRawBase64] = useState('');

    const { handleChange } = props;

    const convertToBase64 = (selectedFile) => {
        //Read File
        //Check File is not Empty
        if (selectedFile.length > 0) {
            // Select the very first file from list
            let fileToLoad = selectedFile[0];
            // FileReader function for read the file.
            let fileReader = new FileReader();
            let base64;
            // Onload of file read the file content
            fileReader.onload = function (fileLoadedEvent) {
                base64 = fileLoadedEvent.target.result;
                setRawBase64(base64);
            };
            // Convert data to base64
            fileReader.readAsDataURL(fileToLoad);
        }
        return {};
    }

    const onDrop = (acceptedFiles) => {
        // Do something with the files
        convertToBase64(acceptedFiles);
        // const req = axios.post('/upload')
        // acceptedFiles.forEach(file => {
        //     req.attach(file.name, file)
        // })
        // //req.end(callback)
    }
    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, application/pdf'
    });

    const files = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    useEffect(() => {
        if (rawBase64) {
            const loaderTriggerFlag = 2;
            const base64_arr = (rawBase64).split(';');
            handleChange(loaderTriggerFlag,
                {
                    fileBase64: base64_arr[1].split(',')[1],
                    type: base64_arr[0].split(':')[1]
                });
        }

    }, [rawBase64, handleChange]);

    return (
        <div className="uploader-container">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p className="uploader">Drag 'n' drop some files here, or click to select files</p>
                }
            </div>
            <aside>
                <h4>Files</h4>
                <ul>{files}</ul>
            </aside>
        </div>

    )
}
