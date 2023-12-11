import { dirname, join } from "path";
import { validateCourse } from "./builder/course";
import piko from "picocolors";
import { BuilderError } from "./builder/common";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const courseDir = join(__dirname, "..", "course");

const main = async () => {
  try {
    const courseLabel = piko.blue("[Course]");
    console.log(`${courseLabel} Validating...`);
    await validateCourse(courseDir);
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
