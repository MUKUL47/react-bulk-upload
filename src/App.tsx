import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import FileBulkUpload from "./use-bulk-upload";
import { FileObj, UploadType } from "./bulk-upload";
function App() {
  const [count, setCount] = useState(0);
  const [t, st] = useState(true);
  function requestArgs({ file, ...props }: any) {
    debugger;
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
      <button onClick={() => st(!t)}>toggle</button>
      {(t && (
        <FileBulkUpload
          concurrency={20}
          requestArguments={requestArgs}
          progressFrequencyUpdate={50}
          requestOptions={{ uploadProgress: true }}
          onUploadComplete={() => {
            console.log("UPLOAD COMPLETED");
          }}
          uploadType={"FILES_HIERARCHY" as any}
        >
          {({
            startUpload,
            files,
            cancelUpload,
            retryUpload,
            fetchFilesHierarchy,
          }) => (
            <div>
              <button onClick={() => fetchFilesHierarchy(startUpload)}>
                fetch dir
              </button>
              {console.log(files)}
              <input
                type="file"
                multiple
                onChange={(e) => {
                  startUpload(e.target.files);
                }}
              />
              <input
                type="file"
                multiple
                onChange={(e) => {
                  startUpload(e.target.files);
                }}
              />
              {/* <div>COMPLETED {files?.completed}</div>
              <div>
                inProgress {JSON.stringify(Array.from(files?.inProgress)?.[0])}
              </div>
              <div>inQueue {files?.inQueue.size}</div>
              <div>failed {files?.failed.size}</div> */}
              <div>IN PROGRESS</div>
              {[...files.inProgress].map(([_, fileObj]) => {
                return (
                  <div>
                    <p>
                      {fileObj.file?.name} = {fileObj.uploadCount}
                    </p>
                    <button
                      onClick={() => {
                        cancelUpload(fileObj as FileObj);
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                );
              })}
              <div>FAILED</div>
              <div>failed {files?.failed.size}</div>
              {[...files.failed].map(([_, fileObj]) => {
                return (
                  <div>
                    <p>{fileObj.file?.name}</p>
                    <button
                      onClick={() => {
                        retryUpload([fileObj] as FileObj[]);
                      }}
                    >
                      retry
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </FileBulkUpload>
      )) ||
        null}
    </>
  );
}

export default App;
