var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// index.ts
import BulkUpload from "browser-bulk-upload";
import { FileHierarchyFetcher } from "files-hierarchy";
import { useEffect, useRef, useState } from "react";
function ReactBulkUpload({
  children,
  concurrency,
  requestArguments,
  onUploadComplete,
  requestOptions,
  progressFrequencyUpdate,
  isFileHierarchy,
  fileHierarchyProps,
  uploadStarted
}) {
  if (typeof children !== "function") {
    throw new Error("Children must a callback function returning a JSX");
  }
  const [fileResponses, setFileResponses] = useState({
    inQueue: /* @__PURE__ */ new Map(),
    inProgress: /* @__PURE__ */ new Map(),
    completed: 0,
    //new Map(),
    failed: /* @__PURE__ */ new Map()
  });
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const bulkUploadInstance = useRef();
  useEffect(() => {
    const onUpdate = ({
      COMPLETED_UPLOADS,
      FAILED_UPLOADS,
      IN_PROGRESS,
      IN_QUEUE
    }) => {
      setFileResponses({
        inQueue: IN_QUEUE,
        failed: FAILED_UPLOADS,
        inProgress: IN_PROGRESS,
        completed: COMPLETED_UPLOADS
      });
    };
    const bulkUpload = new BulkUpload({
      concurrency,
      requestArguments,
      lastProgressUpload: progressFrequencyUpdate,
      requestOptions,
      onUpdate,
      onUploadComplete,
      isFileHierarchy: !!isFileHierarchy
    });
    const controls = bulkUpload.getControls();
    bulkUploadInstance.current = bulkUpload;
    return () => {
      controls.destroy();
    };
  }, []);
  const startUpload = (files) => {
    var _a, _b, _c;
    if (uploadInProgress) {
      return (_b = (_a = bulkUploadInstance == null ? void 0 : bulkUploadInstance.current) == null ? void 0 : _a.getControls()) == null ? void 0 : _b.updateQueue(files);
    }
    uploadStarted == null ? void 0 : uploadStarted();
    setUploadInProgress(true);
    (_c = bulkUploadInstance.current) == null ? void 0 : _c.start(files);
  };
  const fetchHierarchy = () => {
    return new Promise((resolve) => {
      return new FileHierarchyFetcher({
        attributes: __spreadValues({}, fileHierarchyProps || {})
      }).getFiles().then(({ flatDirectories }) => {
        resolve(flatDirectories);
      });
    });
  };
  const cancelUpload = (fileObj) => {
    var _a;
    (_a = bulkUploadInstance.current) == null ? void 0 : _a.getControls().cancel(fileObj);
  };
  const retryUpload = (fileObjs) => {
    var _a;
    (_a = bulkUploadInstance.current) == null ? void 0 : _a.getControls().retry(fileObjs);
  };
  const destroy = () => {
    var _a;
    (_a = bulkUploadInstance.current) == null ? void 0 : _a.getControls().destroy();
  };
  return children({
    files: fileResponses,
    startUpload,
    cancelUpload,
    destroy,
    retryUpload,
    uploadInProgress,
    fetchFilesHierarchy: (cb) => {
      if (!isFileHierarchy)
        throw new Error(
          "'isFileHierarchy' flag is not set, please enable it before accessing folder-structure hierarchy"
        );
      fetchHierarchy().then(cb);
    }
  });
}
export {
  ReactBulkUpload as default
};
