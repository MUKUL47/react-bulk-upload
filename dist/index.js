"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var bulk_react_upload_exports = {};
__export(bulk_react_upload_exports, {
  default: () => ReactBulkUpload
});
module.exports = __toCommonJS(bulk_react_upload_exports);
var import_browser_bulk_upload = __toESM(require("browser-bulk-upload"));
var import_files_hierarchy = require("files-hierarchy");
var import_react = require("react");
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
  const [fileResponses, setFileResponses] = (0, import_react.useState)({
    inQueue: /* @__PURE__ */ new Map(),
    inProgress: /* @__PURE__ */ new Map(),
    completed: 0,
    //new Map(),
    failed: /* @__PURE__ */ new Map()
  });
  const [uploadInProgress, setUploadInProgress] = (0, import_react.useState)(false);
  const bulkUploadInstance = (0, import_react.useRef)();
  (0, import_react.useEffect)(() => {
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
    const bulkUpload = new import_browser_bulk_upload.default({
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
      return new import_files_hierarchy.FileHierarchyFetcher({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
