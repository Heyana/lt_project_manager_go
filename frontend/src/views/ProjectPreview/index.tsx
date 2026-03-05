import { defineComponent, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getProject, Project } from "@/api/project";
import "./style.less";

export default defineComponent({
  name: "ProjectPreview",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      project: null as Project | null,
      loading: true,
      error: "",
    });

    const loadProject = async () => {
      const id = Number(route.params.id);
      if (!id) {
        state.error = "无效的项目ID";
        state.loading = false;
        return;
      }

      try {
        state.project = await getProject(id);
      } catch (error) {
        console.error("加载项目失败:", error);
        state.error = "加载项目失败";
      } finally {
        state.loading = false;
      }
    };

    const handleBack = () => {
      router.back();
    };

    onMounted(() => {
      loadProject();
    });

    return () => (
      <div class="project-preview">
        <div class="preview-header">
          <div class="back-btn" onClick={handleBack}>
            ← 返回
          </div>
          <h2>{state.project?.name || "项目预览"}</h2>
        </div>

        <div class="preview-content">
          {state.loading ? (
            <div class="loading">加载中...</div>
          ) : state.error ? (
            <div class="error">{state.error}</div>
          ) : state.project?.link_type === "videoPath" ? (
            <div class="video-container">
              <video controls autoplay>
                <source src={state.project.link} type="video/mp4" />
                您的浏览器不支持视频播放
              </video>
            </div>
          ) : state.project?.link_type === "local" ? (
            <iframe
              src={state.project.link}
              class="preview-iframe"
              frameborder="0"
            />
          ) : (
            <div class="error">不支持的项目类型</div>
          )}
        </div>
      </div>
    );
  },
});
