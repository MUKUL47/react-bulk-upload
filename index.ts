import { AxiosRequestConfig } from "axios";
import BulkUpload, {
  EventType,
  FileObj,
  StandardFile,
} from "browser-bulk-upload";
import { Directory, FileHierarchyFetcher } from "files-hierarchy";
import React, { useEffect, useRef, useState } from "react";
export type FilesResponse = {
  inQueue: StandardFile<Partial<FileObj>>;
  inProgress: StandardFile<Partial<FileObj>>;
  completed: number; //StandardFile<Partial<FileObj>>;
  failed: StandardFile<Partial<FileObj>>;
};
export type ChildrenParam = {
  startUpload: (files: any[]) => void;
  uploadInProgress: boolean;
  files: FilesResponse;
  cancelUpload: (fileObj: FileObj) => void;
  retryUpload: (fileObj: FileObj[]) => void;
  destroy: () => void;
  fetchFilesHierarchy: (cb: (directories: Array<Directory>) => void) => void;
};
export type Props = {
  children: (childrenParam: ChildrenParam) => React.DetailedHTMLProps<any, any>;
  concurrency: number;
  requestArguments: (fileObj: FileObj) => Partial<AxiosRequestConfig>;
  isFileHierarchy?: Boolean;
  requestOptions?: {
    downloadProgress?: boolean;
    uploadProgress?: boolean;
  };
  uploadStarted?: () => void;
  onUploadComplete?: () => void;
  progressFrequencyUpdate?: number;
  fileHierarchyProps?: Record<string, any>;
};
export default function ReactBulkUpload({
  children,
  concurrency,
  requestArguments,
  onUploadComplete,
  requestOptions,
  progressFrequencyUpdate,
  isFileHierarchy,
  fileHierarchyProps,
  uploadStarted,
}: Props) {
  if (typeof children !== "function") {
    throw new Error("Children must a callback function returning a JSX");
  }
  const [fileResponses, setFileResponses] = useState<FilesResponse>({
    inQueue: new Map(),
    inProgress: new Map(),
    completed: 0, //new Map(),
    failed: new Map(),
  });
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const bulkUploadInstance = useRef<BulkUpload>();
  useEffect(() => {
    const onUpdate = ({
      COMPLETED_UPLOADS,
      FAILED_UPLOADS,
      IN_PROGRESS,
      IN_QUEUE,
    }: EventType) => {
      setFileResponses({
        inQueue: IN_QUEUE,
        failed: FAILED_UPLOADS,
        inProgress: IN_PROGRESS,
        completed: COMPLETED_UPLOADS,
      });
    };
    const bulkUpload = new BulkUpload({
      concurrency,
      requestArguments,
      lastProgressUpload: progressFrequencyUpdate,
      requestOptions,
      onUpdate,
      onUploadComplete,
      isFileHierarchy: !!isFileHierarchy,
    });
    const controls = bulkUpload.getControls();
    bulkUploadInstance.current = bulkUpload;
    return () => {
      controls.destroy();
    };
  }, []);

  const startUpload = (files: any[]) => {
    if (uploadInProgress) {
      return bulkUploadInstance?.current?.getControls()?.updateQueue(files);
    }
    uploadStarted?.();
    setUploadInProgress(true);
    bulkUploadInstance.current?.start(files);
  };

  const fetchHierarchy = (): Promise<Array<Directory>> => {
    return new Promise((resolve) => {
      return new FileHierarchyFetcher({
        attributes: {
          ...(fileHierarchyProps || {}),
        },
      })
        .getFiles()
        .then(({ flatDirectories }: { flatDirectories: Array<Directory> }) => {
          resolve(flatDirectories);
        });
    });
  };

  const cancelUpload = (fileObj: FileObj) => {
    bulkUploadInstance.current?.getControls().cancel(fileObj);
  };

  const retryUpload = (fileObjs: FileObj[]) => {
    bulkUploadInstance.current?.getControls().retry(fileObjs);
  };

  const destroy = () => {
    bulkUploadInstance.current?.getControls().destroy();
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
    },
  });
}
