# React Bulk Upload wrapper Component with concurrent request pool based on browser-bulk-upload vanilla library (https://www.npmjs.com/package/browser-bulk-upload)

## Usage

```
npm i react-bulk-upload
```

```js
import React from "react";
import "./example.css";
import { FileObj } from "browser-bulk-upload";
import FileBulkUpload from ".";
function App() {
  function requestArgs({ file }: any) { //synchronous function returning axios config arguments
    const formData = new FormData();
    formData.append("file", file);
    return {
      url: "http://localhost:3000/upload",
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
  }
  return (
    <>
      <FileBulkUpload
        concurrency={2} //total active concurrent request(s)
        requestArguments={requestArgs} //callback returning axios config
        progressFrequencyUpdate={10} //in milliseconds how fast upload/download progress update should be invoked
        requestOptions={{ uploadProgress: true }} //uploadProgress or downloadProgress
        onUploadComplete={() => { //on all request complete
          console.log("UPLOAD COMPLETED");
          setTimeout(() => alert("UPLOAD COMPLETED"), 500);
        }}
        /**isFileHierarchy={true}**/
    /**enable this flag if you have a requirement of sending folders as a BFS like Google-Drive folder upload to fetch all folder path(s), please use this library : https://www.npmjs.com/package/files-hierarchy **/
      >
        {({ startUpload, files, cancelUpload, retryUpload }: any) => (
          <div className="flex flex-column gap-10p bulk-upload">
            <div className="flex justify-center">
              <input
                type="file"
                multiple
                className="flex"
                onChange={(e) => {
                  startUpload(e.target.files);
                }}
              />
            </div>
            <div className="flex flex-row gap-1r">
              <div className="flex-1 gap-10p flex flex-column">
                <h5>IN QUEUE ({files.inQueue.size})</h5>
                {[...files.inQueue].map(([_, fileObj]) => {
                  return (
                    <div className="flex flex-column justify-center align-center">
                      <p>{fileObj.file?.name}</p>
                      <button
                        onClick={() => {
                          cancelUpload(fileObj as FileObj);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 gap-10p flex flex-column">
                <h5>IN PROGRESS ({files.inProgress.size})</h5>
                {[...files.inProgress].map(([_, fileObj]) => {
                  return (
                    <div className="flex flex-column justify-center align-center">
                      <p>
                        {fileObj.file?.name} ({`${fileObj.uploadCount} %`})
                      </p>
                      <button
                        onClick={() => {
                          cancelUpload(fileObj as FileObj);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 gap-10p flex flex-column">
                <h5>FAILED ({files.failed.size})</h5>
                {[...files.failed].map(([_, fileObj]) => {
                  return (
                    <div className="flex flex-column justify-center align-center">
                      <p>{fileObj.file?.name}</p>
                      <button
                        onClick={() => {
                          retryUpload([fileObj as FileObj]);
                        }}
                      >
                        Retry ({fileObj.isCancelled && "Cancelled by user"})
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 gap-10p flex flex-column">
                <h5>SUCCESS ({files.completed})</h5>
              </div>
            </div>
          </div>
        )}
      </FileBulkUpload>
    </>
  );
}
```
