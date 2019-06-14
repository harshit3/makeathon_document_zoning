import React, { useCallback } from 'react';
import './css/FileUploader.css';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { convertToBase64 } from '../util/utilFunctions';

export default function FileUploader() {

    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        let files = convertToBase64(acceptedFiles)
        // const req = axios.post('/upload')
        // acceptedFiles.forEach(file => {
        //     req.attach(file.name, file)
        // })
        // //req.end(callback)
    }, [])
    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, application/pdf'
    })

    const files = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    return (
        <div className="uploader-container">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </div>
            <aside>
                <h4>Files</h4>
                <ul>{files}</ul>
            </aside>
        </div>

    )
}
