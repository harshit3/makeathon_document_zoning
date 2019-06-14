export const convertToBase64 = (selectedFile) => {
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
            // Print data in console
        };
        // Convert data to base64
        fileReader.readAsDataURL(fileToLoad);
        return fileReader;
    }
    return {};
}