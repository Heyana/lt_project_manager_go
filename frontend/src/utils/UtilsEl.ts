import { ElMessage, ElMessageBox } from "element-plus";

export const tip = (
  m: string,
  status: "success" | "warning" | "error" | "info" = "success",
  options?: {
    duration?: Number;
  }
) => {
  const { duration } = options || {};
  return ElMessage({
    showClose: true,
    duration: (duration as any) || 2000,
    message: m,
    type: status,
  });
};

export const prompt = () => {
  return ElMessageBox.prompt("请输入要保存的文件名", "Tip", {
    confirmButtonText: "完成",
    cancelButtonText: "取消保存",
  });
};

export const confirm = (msg: string) => {
  return ElMessageBox.confirm(msg, {
    confirmButtonText: "覆盖",
    cancelButtonText: "取消保存",
    type: "warning",
  });
};
