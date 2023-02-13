import { AxiosRequestConfig } from 'axios';
import { StandardFile, FileObj } from 'browser-bulk-upload';
import { Directory } from 'files-hierarchy';
import React from 'react';

type FilesResponse = {
    inQueue: StandardFile<Partial<FileObj>>;
    inProgress: StandardFile<Partial<FileObj>>;
    completed: number;
    failed: StandardFile<Partial<FileObj>>;
};
type ChildrenParam = {
    startUpload: (files: any[]) => void;
    uploadInProgress: boolean;
    files: FilesResponse;
    cancelUpload: (fileObj: FileObj) => void;
    retryUpload: (fileObj: FileObj[]) => void;
    destroy: () => void;
    fetchFilesHierarchy: (cb: (directories: Array<Directory>) => void) => void;
};
type Props = {
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
declare function ReactBulkUpload({ children, concurrency, requestArguments, onUploadComplete, requestOptions, progressFrequencyUpdate, isFileHierarchy, fileHierarchyProps, uploadStarted, }: Props): any;

export { ChildrenParam, FilesResponse, Props, ReactBulkUpload as default };
