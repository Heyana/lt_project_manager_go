import { defineComponent, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { PROJECT_TYPES, ProjectType } from "@/types/project";
import { getProjects, Project } from "@/api/project";
import "./style.less";

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRouter();

    const state = reactive({
      activeType: "table" as ProjectType | "all",
      projects: [] as Project[],
      loading: false,
    });

    const loadProjects = async (type: string = "all") => {
      state.loading = true;
      try {
        const res = await getProjects({ type, page: 1, page_size: 100 });
        state.projects = res.list;
      } catch (error) {
        console.error("加载项目失败:", error);
      } finally {
        state.loading = false;
      }
    };

    const handleTypeClick = (type: ProjectType) => {
      state.activeType = type;
      loadProjects(type);
    };

    const handleProjectClick = (project: Project) => {
      if (project.link_type === "url") {
        window.open(project.link, "_blank");
      } else if (
        project.link_type === "videoPath" ||
        project.link_type === "local"
      ) {
        router.push(`/preview/${project.id}`);
      }
    };

    onMounted(() => {
      loadProjects("all");
    });

    return () => (
      <div class="home">
        <div class="home-header">
          <h1>零拓项目管理器</h1>
        </div>

        <div class="home-content">
          <div class="home-menu">
            {Object.entries(PROJECT_TYPES).map(([key, value]) => (
              <div
                key={key}
                class={["menu-item", state.activeType === key && "active"]}
                onClick={() => handleTypeClick(key as ProjectType)}
              >
                <div class="menu-icon"></div>
                <p>{value.name}</p>
              </div>
            ))}
          </div>

          <div class="project-list">
            {state.loading ? (
              <div class="loading">加载中...</div>
            ) : state.projects.length === 0 ? (
              <div class="empty">暂无项目</div>
            ) : (
              <div class="project-grid">
                {state.projects.map((project) => (
                  <div
                    key={project.id}
                    class="project-card"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div class="project-thumbnail">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} />
                      ) : (
                        <div class="placeholder">暂无封面</div>
                      )}
                    </div>
                    <div class="project-info">
                      <h3 class="project-name">{project.name}</h3>
                      <p class="project-desc">
                        {project.description || "暂无描述"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
