import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "App",
  setup: () => () => com(),
  mounted() {},
});

const com = () => <div>App</div>;
