import { defineComponent, reactive, ref, onMounted, watch } from "vue";
import { NButton, NInput, NModal, useMessage } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import {
  getFileList,
  uploadFile,
  uploadFolder,
  createFolder,
  deleteFile,
  downloadFile,
  refreshThumbnail,
  getBreadcrumbPath,
  type FileDocument,
  type BreadcrumbItem,
} from "../../api/fileLibrary";
import "./style/fileLibrary.less";

export default defineComponent({
  name: "FileLibrary",
  setup() {
    const message = useMessage();
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      files: [] as FileDocument[],
      loading: false,
      currentPath: [] as BreadcrumbItem[],
      showCreateFolder: false,
      folderName: "",
      folderDescription: "",
      total: 0,
      page: 1,
      pageSize: 50,
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      selectedFile: null as FileDocument | null,
      // 拖拽上传
      isDragging: false,
      dragCounter: 0,
      isDragUploading: false,
      dragUploadProgress: 0,
      dragUploadStatus: "",
      // 上传对话框
      showUploadDialog: false,
      uploadForm: {
        name: "",
        description: "",
        category: "",
        tags: "",
        file: null as File | null,
      },
      uploadProgress: 0,
      isUploading: false,
    });

    const fileInputRef = ref<HTMLInputElement>();

    // 获取当前文件夹 ID
    const getCurrentFolderId = (): number | undefined => {
      const folderId = route.params.folderId;
      return folderId ? Number(folderId) : undefined;
    };

    // 从路由参数构建路径
    const buildPathFromRoute = async () => {
      const folderId = route.params.folderId;
      if (!folderId) {
        state.currentPath = [];
        return;
      }

      // 从后端获取面包屑路径（使用递归 CTE，性能最优）
      try {
        const parentId = Number(folderId);
        const breadcrumbPath = await getBreadcrumbPath(parentId);

        // 设置路径（去掉根目录，因为我们会单独显示）
        state.currentPath = breadcrumbPath.filter((item) => item.id !== 0);

        // 加载该文件夹的内容
        await loadFiles(parentId);
      } catch (error) {
        console.error("加载文件夹失败:", error);
        state.currentPath = [];
        await loadFiles();
      }
    };

    // 加载文件列表
    const loadFiles = async (parentId?: number) => {
      state.loading = true;
      try {
        const data = await getFileList({
          parent_id: parentId,
          page: state.page,
          page_size: state.pageSize,
        });
        state.files = data.list || [];
        state.total = data.total;
      } catch (error) {
        message.error("加载文件列表失败");
        console.error(error);
      } finally {
        state.loading = false;
      }
    };

    // 上传文件
    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (!files || files.length === 0) return;

      state.loading = true;
      try {
        const parentId = getCurrentFolderId();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file) {
            await uploadFile(file, parentId);
          }
        }
        message.success("上传成功");
        await loadFiles(parentId);
      } catch (error) {
        message.error("上传失败");
        console.error(error);
      } finally {
        state.loading = false;
        if (target) target.value = "";
      }
    };

    // 打开上传对话框
    const openUploadDialog = () => {
      state.showUploadDialog = true;
      state.uploadForm = {
        name: "",
        description: "",
        category: "",
        tags: "",
        file: null,
      };
    };

    // 上传文件（带元数据）
    const handleUploadWithMetadata = async () => {
      if (!state.uploadForm.file) {
        message.warning("请选择文件");
        return;
      }

      try {
        state.isUploading = true;
        state.uploadProgress = 0;

        const parentId = getCurrentFolderId();
        await uploadFile(
          state.uploadForm.file,
          parentId,
          {
            name: state.uploadForm.name || state.uploadForm.file.name,
            description: state.uploadForm.description,
            category: state.uploadForm.category,
            tags: state.uploadForm.tags,
          },
          (progress) => {
            state.uploadProgress = progress;
          },
        );

        message.success("上传成功");
        state.showUploadDialog = false;
        await loadFiles(parentId);
      } catch (error) {
        message.error("上传失败");
        console.error(error);
      } finally {
        state.isUploading = false;
        state.uploadProgress = 0;
      }
    };

    // 文件选择
    const handleFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        state.uploadForm.file = file;
        if (!state.uploadForm.name) {
          state.uploadForm.name = file.name.replace(/\.[^/.]+$/, "");
        }
      }
    };

    // 创建文件夹
    const handleCreateFolder = async () => {
      if (!state.folderName.trim()) {
        message.warning("请输入文件夹名称");
        return;
      }

      try {
        const parentId = getCurrentFolderId();
        await createFolder(state.folderName, parentId, state.folderDescription);
        message.success("创建成功");
        state.showCreateFolder = false;
        state.folderName = "";
        state.folderDescription = "";
        await loadFiles(parentId);
      } catch (error) {
        message.error("创建失败");
        console.error(error);
      }
    };

    // 删除文件
    const handleDelete = async (file: FileDocument) => {
      if (!confirm(`确定要删除 ${file.name} 吗？`)) return;

      try {
        await deleteFile(file.id);
        message.success("删除成功");
        const parentId = getCurrentFolderId();
        await loadFiles(parentId);
      } catch (error) {
        message.error("删除失败");
        console.error(error);
      }
    };

    // 重新生成缩略图
    const handleRefreshThumbnail = async (file: FileDocument) => {
      try {
        message.loading("正在生成缩略图...", { duration: 0 });
        await refreshThumbnail(file.id);
        message.destroyAll();
        message.success("缩略图生成成功");
        const parentId = getCurrentFolderId();
        await loadFiles(parentId);
      } catch (error) {
        message.destroyAll();
        message.error("缩略图生成失败");
        console.error(error);
      }
    };

    // 进入文件夹
    const enterFolder = (folder: FileDocument) => {
      if (!folder.is_folder) return;
      router.push(`/home/filelibrary/${folder.id}`);
    };

    // 返回上级
    const goBack = () => {
      if (state.currentPath.length === 0) {
        return;
      } else if (state.currentPath.length === 1) {
        router.push("/home/filelibrary");
      } else {
        const parentId = state.currentPath[state.currentPath.length - 2]?.id;
        router.push(`/home/filelibrary/${parentId}`);
      }
    };

    // 面包屑导航
    const navigateTo = (index: number) => {
      if (index === -1) {
        // 点击根目录
        state.currentPath = [];
        router.push("/home/filelibrary");
      } else {
        state.currentPath = state.currentPath.slice(0, index + 1);
        const folder = state.currentPath[index];
        if (folder) {
          router.push(`/home/filelibrary/${folder.id}`);
        }
      }
    };

    // 格式化文件大小
    const formatSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    // 获取文件图标
    const getFileIcon = (file: FileDocument) => {
      if (file.is_folder) return "📁";
      const ext = file.format?.toLowerCase();
      const iconMap: Record<string, string> = {
        pdf: "📄",
        doc: "📝",
        docx: "📝",
        xls: "📊",
        xlsx: "📊",
        ppt: "📽️",
        pptx: "📽️",
        jpg: "🖼️",
        jpeg: "🖼️",
        png: "🖼️",
        gif: "🖼️",
        webp: "🖼️",
        mp4: "🎬",
        mp3: "🎵",
        zip: "📦",
        rar: "📦",
      };
      return iconMap[ext || ""] || "📄";
    };

    // 右键菜单
    const handleContextMenu = (e: MouseEvent, file: FileDocument) => {
      e.preventDefault();
      state.selectedFile = file;
      state.contextMenuX = e.clientX;
      state.contextMenuY = e.clientY;
      state.contextMenuVisible = true;
    };

    // 右键菜单项
    const contextMenuItems = [
      {
        key: "download",
        label: "下载",
        show: () => true, // 文件和文件夹都可以下载
        action: (file: FileDocument) => downloadFile(file.id),
      },
      {
        key: "refresh-thumbnail",
        label: "重新生成缩略图",
        show: (file: FileDocument) =>
          !file.is_folder &&
          ["jpg", "jpeg", "png", "gif", "webp", "mp4", "pdf"].includes(
            file.format?.toLowerCase() || "",
          ),
        action: (file: FileDocument) => handleRefreshThumbnail(file),
      },
      {
        key: "delete",
        label: "删除",
        show: () => true,
        action: (file: FileDocument) => handleDelete(file),
      },
    ];

    // 拖拽上传处理
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      state.dragCounter++;
      if (state.dragCounter === 1) {
        state.isDragging = true;
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      state.dragCounter--;
      if (state.dragCounter === 0) {
        state.isDragging = false;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      state.isDragging = false;
      state.dragCounter = 0;

      const items = e.dataTransfer?.items;
      if (!items || items.length === 0) return;

      const firstItem = items[0];
      const entry = firstItem.webkitGetAsEntry?.();

      if (entry?.isDirectory) {
        // 上传文件夹
        const files: File[] = [];
        const filePaths: string[] = [];

        const traverseDirectory = async (
          dirEntry: any,
          path: string = "",
        ): Promise<void> => {
          const reader = dirEntry.createReader();
          const entries = await new Promise<any[]>((resolve) => {
            reader.readEntries((entries: any[]) => resolve(entries));
          });

          for (const entry of entries) {
            const fullPath = path ? `${path}/${entry.name}` : entry.name;

            if (entry.isFile) {
              const file = await new Promise<File>((resolve) => {
                entry.file((file: File) => resolve(file));
              });
              files.push(file);
              filePaths.push(fullPath);
            } else if (entry.isDirectory) {
              await traverseDirectory(entry, fullPath);
            }
          }
        };

        try {
          state.isDragUploading = true;
          state.dragUploadProgress = 0;
          state.dragUploadStatus = "正在读取文件夹...";

          await traverseDirectory(entry, entry.name);

          if (files.length === 0) {
            message.warning("文件夹为空");
            state.isDragUploading = false;
            return;
          }

          state.dragUploadStatus = `正在上传 ${files.length} 个文件...`;

          const parentId = getCurrentFolderId();
          await uploadFolder(
            files,
            filePaths,
            parentId,
            undefined,
            (progress) => {
              state.dragUploadProgress = progress;
            },
          );

          message.success("上传成功");
          await loadFiles(parentId);
        } catch (error: any) {
          message.error("上传失败");
          console.error(error);
        } finally {
          state.isDragUploading = false;
          state.dragUploadProgress = 0;
          state.dragUploadStatus = "";
        }
      } else {
        // 上传多个文件
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }

        if (files.length === 0) return;

        try {
          state.isDragUploading = true;
          state.dragUploadProgress = 0;
          state.dragUploadStatus = `正在上传 ${files.length} 个文件...`;

          const parentId = getCurrentFolderId();
          let completed = 0;

          for (const file of files) {
            await uploadFile(file, parentId, undefined, (progress) => {
              state.dragUploadProgress = Math.round(
                ((completed + progress / 100) * 100) / files.length,
              );
            });
            completed++;
          }

          message.success("上传成功");
          await loadFiles(parentId);
        } catch (error: any) {
          message.error("上传失败");
          console.error(error);
        } finally {
          state.isDragUploading = false;
          state.dragUploadProgress = 0;
          state.dragUploadStatus = "";
        }
      }
    };

    // 监听路由变化
    watch(
      () => route.params.folderId,
      async (folderId) => {
        if (!folderId) {
          // 根目录
          state.currentPath = [];
          await loadFiles();
        } else {
          // 子文件夹
          await buildPathFromRoute();
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      // 点击其他地方关闭右键菜单
      document.addEventListener("click", () => {
        state.contextMenuVisible = false;
      });
    });

    return () => (
      <div
        class="file-library"
        onDragenter={handleDragEnter}
        onDragleave={handleDragLeave}
        onDragover={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 拖拽上传遮罩 */}
        {(state.isDragging || state.isDragUploading) && (
          <div
            class={`drag-overlay ${state.isDragUploading ? "uploading" : ""}`}
          >
            {state.isDragUploading ? (
              <div class="upload-progress-container">
                <div class="upload-status">{state.dragUploadStatus}</div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style={{ width: `${state.dragUploadProgress}%` }}
                    />
                  </div>
                  <span class="progress-text">{state.dragUploadProgress}%</span>
                </div>
              </div>
            ) : (
              <div class="drag-hint">
                <div class="drag-icon">📁</div>
                <div class="drag-text">松开鼠标上传</div>
                <div class="drag-subtext">支持文件和文件夹</div>
              </div>
            )}
          </div>
        )}

        <div class="file-library-header">
          <div class="breadcrumb">
            <span onClick={() => navigateTo(-1)} class="breadcrumb-item">
              根目录
            </span>
            {state.currentPath.map((folder, index) => (
              <span key={folder.id}>
                <span class="separator">/</span>
                <span onClick={() => navigateTo(index)} class="breadcrumb-item">
                  {folder.name}
                </span>
              </span>
            ))}
          </div>
          <div class="actions">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <NButton type="primary" onClick={openUploadDialog}>
              上传文件
            </NButton>
            <NButton onClick={() => (state.showCreateFolder = true)}>
              新建文件夹
            </NButton>
            {state.currentPath.length > 0 && (
              <NButton onClick={goBack}>返回上级</NButton>
            )}
          </div>
        </div>

        <div class="file-list">
          {state.loading ? (
            <div class="loading">加载中...</div>
          ) : state.files.length === 0 ? (
            <div class="empty">暂无文件</div>
          ) : (
            <div class="file-grid">
              {state.files.map((file) => (
                <div
                  key={file.id}
                  class="file-item"
                  onClick={() => file.is_folder && enterFolder(file)}
                  onContextmenu={(e) => handleContextMenu(e, file)}
                >
                  <div class="file-icon">
                    {file.thumbnail_url ? (
                      <img src={file.thumbnail_url} alt={file.name} />
                    ) : (
                      <span class="icon-text">{getFileIcon(file)}</span>
                    )}
                  </div>
                  <div class="file-info">
                    <div class="file-name" title={file.name}>
                      {file.name}
                    </div>
                    {file.description && (
                      <div class="file-description" title={file.description}>
                        {file.description}
                      </div>
                    )}
                    <div class="file-meta">
                      {file.is_folder ? (
                        <>
                          <span class="file-tag">
                            {file.child_count || 0} 个子项
                          </span>
                          {file.total_count > 0 && (
                            <span class="file-tag">
                              {file.total_count} 个文件
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {file.type && (
                            <span class="file-type">{file.type}</span>
                          )}
                          {file.format && (
                            <span class="file-format">
                              {file.format.toUpperCase()}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div class="file-date">
                      <span class="file-size">
                        {formatSize(
                          file.is_folder ? file.total_size : file.file_size,
                        )}
                      </span>
                      <span class="date-text">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <button
                      class="action-btn download"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(file.id);
                      }}
                      title={file.is_folder ? "下载为 ZIP" : "下载"}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button
                      class="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                      title="删除"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右键菜单 */}
        {state.contextMenuVisible && state.selectedFile && (
          <div
            class="context-menu"
            style={{
              position: "fixed",
              left: state.contextMenuX + "px",
              top: state.contextMenuY + "px",
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="context-menu-content">
              {contextMenuItems
                .filter((item) => item.show(state.selectedFile!))
                .map((item) => (
                  <div
                    key={item.key}
                    class="context-menu-item"
                    onClick={() => {
                      item.action(state.selectedFile!);
                      state.contextMenuVisible = false;
                    }}
                  >
                    {item.label}
                  </div>
                ))}
            </div>
          </div>
        )}

        <NModal
          show={state.showCreateFolder}
          onUpdateShow={(show) => (state.showCreateFolder = show)}
        >
          <div class="create-folder-modal">
            <h3>新建文件夹</h3>
            <NInput
              v-model:value={state.folderName}
              placeholder="请输入文件夹名称"
              onKeyup={(e: KeyboardEvent) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <NInput
              v-model:value={state.folderDescription}
              placeholder="请输入描述（可选）"
              type="textarea"
              rows={3}
              style={{ marginTop: "12px" }}
            />
            <div class="modal-actions">
              <NButton onClick={() => (state.showCreateFolder = false)}>
                取消
              </NButton>
              <NButton type="primary" onClick={handleCreateFolder}>
                确定
              </NButton>
            </div>
          </div>
        </NModal>

        {/* 上传文件对话框 */}
        <NModal
          show={state.showUploadDialog}
          onUpdateShow={(show) => (state.showUploadDialog = show)}
          maskClosable={!state.isUploading}
          closable={!state.isUploading}
        >
          <div class="upload-modal">
            <h3>上传文件</h3>
            <div class="form-item">
              <label>选择文件 *</label>
              <input
                type="file"
                onChange={handleFileSelect}
                disabled={state.isUploading}
              />
            </div>
            <div class="form-item">
              <label>文件名称</label>
              <NInput
                v-model:value={state.uploadForm.name}
                placeholder="留空则使用原文件名"
                disabled={state.isUploading}
              />
            </div>
            <div class="form-item">
              <label>分类</label>
              <NInput
                v-model:value={state.uploadForm.category}
                placeholder="请输入分类"
                disabled={state.isUploading}
              />
            </div>
            <div class="form-item">
              <label>标签</label>
              <NInput
                v-model:value={state.uploadForm.tags}
                placeholder="多个标签用逗号分隔"
                disabled={state.isUploading}
              />
            </div>
            <div class="form-item">
              <label>描述</label>
              <NInput
                v-model:value={state.uploadForm.description}
                type="textarea"
                rows={3}
                placeholder="请输入描述"
                disabled={state.isUploading}
              />
            </div>
            {state.isUploading && (
              <div class="form-item">
                <label>上传进度</label>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      style={{ width: `${state.uploadProgress}%` }}
                    />
                  </div>
                  <span class="progress-text">{state.uploadProgress}%</span>
                </div>
              </div>
            )}
            <div class="modal-actions">
              <NButton
                onClick={() => (state.showUploadDialog = false)}
                disabled={state.isUploading}
              >
                取消
              </NButton>
              <NButton
                type="primary"
                onClick={handleUploadWithMetadata}
                loading={state.isUploading}
                disabled={!state.uploadForm.file}
              >
                上传
              </NButton>
            </div>
          </div>
        </NModal>
      </div>
    );
  },
});
