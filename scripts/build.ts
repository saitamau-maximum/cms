import { dirname, join } from "path";
import { buildCourse } from "./builder/course";
import piko from "picocolors";
import { mkdir } from "fs/promises";
import { BuilderError } from "./builder/common";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const distDir = join(__dirname, "..", "dist");
const courseDir = join(__dirname, "..", "course");
const distCourseDir = join(__dirname, "..", "dist", "course");

const main = async () => {
  try {
    await mkdir(distDir);

    const courseLabel = piko.blue("[Course]");
    console.log(`${courseLabel} Building...`);
    await buildCourse(courseDir, distCourseDir);
    console.log(`${courseLabel} Done.`);
  } catch (e) {
    if (e instanceof BuilderError) {
      console.error(piko.red(e.message));
      console.error(`Path: ${e.path}`);
    } else {
      console.error(piko.red("予期せぬエラーが発生しました。"));
      console.error(e);
    }
    process.exit(1);
  }
};

main();
