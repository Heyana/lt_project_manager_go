import { fs, path } from "./UtilsExports";
import { transByte } from "./UtilsJs";
import { eachFileForDir, getExt, getName, hasFile } from "./UtilsNode";

const url = "C:\\Users\\14247\\Pictures\\QQ截图20220711144247.png";
const url1 = "C:\\Users\\14247\\Pictures\\1111.png";

export const createImages = async (
  filePath: string,
  baseDir: string,
  num: number
) => {
  return;
  const name = getName(filePath);
  const ext = getExt(filePath, true);
  for (let index = 0; index < num; index++) {
    const newName = name + "_" + index + ext;
    const savePath = path.join(baseDir, newName);
    if (hasFile(savePath)) return;
    fs.copyFile(filePath, savePath, (a) => {
      console.log(a, "a");
    });
  }
};

export const readDirTest = async (dir: string) => {
  let size = 0;
  await eachFileForDir({
    dir,
    deep: true,
    each(p, stats) {
      if (!stats) return;
      size += stats.size;
      stats = null;
    },
  });
  console.log(size, transByte(size), "size");
};
