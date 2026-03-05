// Content 组件的 Web 适配层
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
} from "@/api/project";

// 项目类型映射
export const projectTypeMap: Record<number, string> = {
  0: "all",
  1: "show", // I SHOW
  2: "tools", // 工具集合
  3: "platform", // 平台应用
  4: "origin", // 源宇宙
};

// 加载项目列表
export async function loadProjects(typeIndex: number, subType?: string) {
  const type = projectTypeMap[typeIndex] || "all";

  try {
    const res = await getProjects({
      type: typeIndex === 0 ? "all" : type,
      page: 1,
      page_size: 100,
    });

    // 如果有子类型筛选
    if (subType) {
      return res.list.filter((p) => p.description === subType);
    }

    return res.list;
  } catch (error) {
    console.error("加载项目失败:", error);
    return [];
  }
}

// 创建项目
ex;
