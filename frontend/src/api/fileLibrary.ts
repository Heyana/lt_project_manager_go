import request from "./request";

export interface FileDocument {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  file_url: string;
  format: string;
  type: string;
  category: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  parent_id?: number;
  is_folder: boolean;
  is_public: boolean;
  file_hash?: string;
  version?: string;
  description?: string;
  tags?: string;
  project?: string;
  department?: string;
  uploaded_by?: string;
  upload_ip?: string;
  download_count: number;
  view_count: number;
  child_count: number;
  total_count: number;
  total_size: number;
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileListData {
  list: FileDocument[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// 获取文件列表
export const getFileList = async (params?: {
  parent_id?: number | null;
  category?: string;
  page?: number;
  page_size?: number;
}): Promise<FileListData> => {
  // 如果 parent_id 是 undefined，表示查询根目录，传递 0
  const queryParams: any = { ...params };
  if (queryParams.parent_id === undefined) {
    queryParams.parent_id = 0;
  }
  return request.get("/documents", { params: queryParams });
};

// 上传文件
export const uploadFile = async (
  file: File,
  parentId?: number,
  metadata?: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string;
  },
  onProgress?: (progress: number) => void,
): Promise<FileDocument> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", metadata?.name || file.name);
  if (metadata?.description)
    formData.append("description", metadata.description);
  if (metadata?.category) formData.append("category", metadata.category);
  if (metadata?.tags) formData.append("tags", metadata.tags);
  if (parentId) {
    formData.append("parent_id", parentId.toString());
  }

  return request.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent: any) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(progress);
      }
    },
  });
};

// 上传文件夹
export const uploadFolder = async (
  files: File[],
  filePaths: string[],
  parentId?: number,
  metadata?: {
    description?: string;
    category?: string;
    tags?: string;
  },
  onProgress?: (progress: number) => void,
): Promise<any> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("file_paths", JSON.stringify(filePaths));
  if (metadata?.description)
    formData.append("description", metadata.description);
  if (metadata?.category) formData.append("category", metadata.category);
  if (metadata?.tags) formData.append("tags", metadata.tags);
  if (parentId) {
    formData.append("parent_id", parentId.toString());
  }

  return request.post("/documents/upload-folder", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent: any) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(progress);
      }
    },
  });
};

// 创建文件夹
export const createFolder = async (
  name: string,
  parentId?: number,
  description?: string,
): Promise<FileDocument> => {
  return request.post("/documents/folder", {
    name,
    parent_id: parentId,
    description,
  });
};

// 删除文件
export const deleteFile = async (id: number): Promise<void> => {
  return request.delete(`/documents/${id}`);
};

// 下载文件
export const downloadFile = (id: number) => {
  window.open(`/api/documents/${id}/download`, "_blank");
};

// 获取文件详情
export const getFileDetail = async (id: number): Promise<FileDocument> => {
  return request.get(`/documents/${id}`);
};

// 重新生成缩略图
export const refreshThumbnail = async (id: number): Promise<FileDocument> => {
  return request.post(`/documents/${id}/refresh-thumbnail`);
};

// 面包屑路径项
export interface BreadcrumbItem {
  id: number;
  name: string;
}

// 获取面包屑路径
export const getBreadcrumbPath = async (
  folderId: number,
): Promise<BreadcrumbItem[]> => {
  return request.get(`/documents/${folderId}/breadcrumb`);
};
