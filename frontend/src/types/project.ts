export const PROJECT_TYPES = {
  table: { name: "工作台", icon: "homeMenuIcon" },
  show: { name: "I SHOW", icon: "homeMenuIcon" },
  tools: { name: "工具", icon: "homeMenuIcon" },
  platform: { name: "平台", icon: "homeMenuIcon" },
  origin: { name: "源宇宙", icon: "homeMenuIcon" },
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;
