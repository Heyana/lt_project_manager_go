import request from "./request";

export interface Project {
  id?: number;
  name: string;
  type: "table" | "show" | "tools" | "platform" | "origin";
  link_type?: "local" | "url" | "videoPath";
  link?: string;
  thumbnail?: string;
  description?: string;
  sort_order?: number;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectListParams {
  type?: string;
  page?: number;
  page_size?: number;
}

export interface ProjectSearchParams {
  keyword?: string;
  type?: string;
  page?: number;
  page_size?: number;
}

export interface PaginationData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// 创建项目
export const createProject = (data: Project) => {
  return request.post<any, Project>("/projects", data);
};

// 获取项目列表
export const getProjects = (params: ProjectListParams) => {
  return request.get<any, PaginationData<Project>>("/projects", { params });
};

// 获取项目详情
export const getProject = (id: number) => {
  return request.get<any, Project>(`/projects/${id}`);
};

// 更新项目
export const updateProject = (id: number, data: Project) => {
  return request.put<any, Project>(`/projects/${id}`, data);
};

// 删除项目
export const deleteProject = (id: number) => {
  return request.delete(`/projects/${id}`);
};

// 更新项目排序
export const updateProjectSort = (id: number, sortOrder: number) => {
  return request.put(`/projects/${id}/sort`, { sort_order: sortOrder });
};

// 搜索项目
export const searchProjects = (params: ProjectSearchParams) => {
  return request.get<any, PaginationData<Project>>("/projects/search", {
    params,
  });
};
