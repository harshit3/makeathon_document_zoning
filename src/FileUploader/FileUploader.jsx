import React, { useState, useEffect } from 'react';
import './css/FileUploader.css';
import { useDropzone } from 'react-dropzone';

export default function FileUploader(props) {

    const [rawBase64, setRawBase64] = useState('');
    const [fileName, setFileName] = useState('')

    const { handleChange, fileStatus } = props;

    const convertToBase64 = (selectedFile) => {
        //Read File
        //Check File is not Empty
        if (selectedFile.length > 0) {
            // Select the very first file from list
            let fileToLoad = selectedFile[0];
            console.log(fileToLoad)
            setFileName(fileToLoad.name)
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
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, application/pdf'
    });

    useEffect(() => {
        if (rawBase64) {
            const loaderTriggerFlag = 2;
            const base64_arr = (rawBase64).split(';');
            handleChange(loaderTriggerFlag,
                {
                    fileBase64: base64_arr[1].split(',')[1],
                    type: base64_arr[0].split(':')[1],
                    fileName: fileName
                });
        }

    }, [rawBase64, handleChange, fileName]);
    console.log(fileStatus)
    return (
        fileStatus === 1 ?
            <div className="parent-container">
                <div className="uploader-container">
                    <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className="uploader">

                            {
                                isDragActive ?
                                    <div className="upload-instruction">Drop the files</div> :
                                    <div className="upload-instruction">Drag and drop<br /> or<br /> Click to Select</div>
                            }
                        </div>

                    </div>
                </div>
            </div> :
            <div className="uploader-container-small">
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className="uploader-small">
                        <i class="fa fa-upload" aria-hidden="true"></i>


                        {
                            isDragActive ?
                                <div className="upload-instruction-small">Drop the files</div> :
                                <div className="upload-instruction-small"> Upload</div>
                        }
                    </div>

                </div>
            </div>




    )
}
