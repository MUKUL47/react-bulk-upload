import { AxiosRequestConfig } from "axios";
import React, { useEffect, useRef, useState } from "react";
import BulkUpload, {
  EventType,
  FileHierarchy,
  FileObj,
  StandardFile,
  UploadType,
} from "./bulk-upload";
import { FileHierarchyFetcher, Directory } from "files-hierarchy";

type FilesResponse = {
  inQueue: StandardFile<Partial<FileObj>>;
  inProgress: StandardFile<Partial<FileObj>>;
  completed: number; //StandardFile<Partial<FileObj>>;
  failed: StandardFile<Partial<FileObj>>;
};
type ChildrenParam = {
  startUpload: (files: File[] | Directory[]) => void;
  uploadInProgress: boolean;
  files: FilesResponse;
  cancelUpload: (fileObj: FileObj) => void;
  retryUpload: (fileObj: FileObj[]) => void;
  updateQueue: (file: File[]) => void;
  destroy: () => void;
  fetchFilesHierarchy: (cb: (directories: Array<Directory>) => void) => void;
};
type Props = {
  children: (childrenParam: ChildrenParam) => React.DetailedHTMLProps<any, any>;
  concurrency: number;
  requestArguments: (fileObj: FileObj) => Partial<AxiosRequestConfig>;
  uploadType?: UploadType;
  requestOptions?: {
    downloadProgress?: boolean;
    uploadProgress?: boolean;
  };
  uploadStarted?: () => void;
  onUploadComplete?: () => void;
  progressFrequencyUpdate?: number;
  fileHierarchyProps?: React.InputHTMLAttributes<HTMLInputElement>;
};
export default function FileBulkUpload({
  children,
  concurrency,
  requestArguments,
  onUploadComplete,
  requestOptions,
  progressFrequencyUpdate,
  uploadType,
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
      uploadType,
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

  const updateQueue = (files: File[]) => {
    bulkUploadInstance.current?.getControls().updateQueue(files);
  };

  return children({
    files: fileResponses,
    startUpload,
    cancelUpload,
    destroy,
    retryUpload,
    updateQueue,
    uploadInProgress,
    fetchFilesHierarchy: (cb) => {
      fetchHierarchy().then(cb);
    },
  });
}
