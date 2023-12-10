import { z } from "zod";
import { validateAndParseMarkdown } from "./common";
import {
  getDirectories,
  getDirectoryName,
  getFileName,
  getFiles,
} from "../utils/find";
import { join } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

const courseFrontMatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.date().optional(),
});

const validateAndParseCourseFrontMatter = (content: string, path: string) =>
  validateAndParseMarkdown(content, path, courseFrontMatterSchema);

type CourseItem = z.infer<typeof courseFrontMatterSchema> & {
  slug: string;
  content: string;
};

const sectionFrontMatterSchema = z.object({
  title: z.string(),
  order: z.number(),
});

const validateAndParseSectionFrontMatter = (content: string, path: string) =>
  validateAndParseMarkdown(content, path, sectionFrontMatterSchema);

type SectionItem = z.infer<typeof sectionFrontMatterSchema> & {
  slug: string;
  content: string;
};

type CourseData = CourseItem & {
  sections: SectionItem[];
};

const sortCourseList = (courseList: CourseData[]) => {
  courseList.forEach((course) => {
    course.sections.sort((a, b) => a.order - b.order);
  });

  courseList.sort((a, b) => {
    if (a.publishedAt && b.publishedAt) {
      return a.publishedAt.getTime() - b.publishedAt.getTime();
    } else if (a.publishedAt) {
      return -1;
    } else if (b.publishedAt) {
      return 1;
    } else {
      return 0;
    }
  });
};

const collectCourseList = async (courseDir: string): Promise<CourseData[]> => {
  const courseDirs = await getDirectories(courseDir);

  const courseList: CourseData[] = [];
  const courseCollectors: (() => Promise<void>)[] = [];

  courseDirs.forEach((courseDir) => {
    courseCollectors.push(async () => {
      const courseTopMdPath = join(courseDir, "index.md");
      const courseTopMdContent = await readFile(courseTopMdPath, "utf8");
      const { frontmatter, content } = validateAndParseCourseFrontMatter(
        courseTopMdContent,
        courseTopMdPath
      );

      const courseData: CourseData = {
        ...frontmatter,
        slug: getDirectoryName(courseTopMdPath),
        content,
        sections: [],
      };

      const courseSectionMdPaths = await getFiles(
        courseDir,
        (path) => path.endsWith(".md") && !path.endsWith("index.md")
      );
      const sectionCollectors: (() => Promise<void>)[] = [];

      courseSectionMdPaths.forEach((sectionMdPath) => {
        sectionCollectors.push(async () => {
          const sectionMdContent = await readFile(sectionMdPath, "utf8");
          const slug = getFileName(sectionMdPath);
          const { frontmatter, content } = validateAndParseSectionFrontMatter(
            sectionMdContent,
            sectionMdPath
          );
          courseData.sections.push({
            ...frontmatter,
            content,
            slug,
          });
        });
      });

      await Promise.all(sectionCollectors.map((c) => c()));

      courseList.push(courseData);
    });
  });

  await Promise.all(courseCollectors.map((c) => c()));

  sortCourseList(courseList);

  return courseList;
};

const outputCourseListIndexJson = async (
  courseList: CourseData[],
  outputDir: string
) => {
  // 転送量を抑えるため、各コースのセクションはセクション数だけの配列に変換する
  const courseEntryList = courseList.map((course) => ({
    ...course,
    sections: undefined,
    sectionsCount: course.sections.length,
  }));

  const json = JSON.stringify(courseEntryList, null, 2);

  const outputPath = join(outputDir, "index.json");

  await writeFile(outputPath, json);
};

const outputCourseDetail = async (course: CourseData, outputDir: string) => {
  const courseDir = join(outputDir, course.slug);
  await mkdir(courseDir);

  const courseJson = JSON.stringify(
    {
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        content: undefined,
      })),
    },
    null,
    2
  );
  const courseJsonPath = join(courseDir, "index.json");
  await writeFile(courseJsonPath, courseJson);

  const sectionEmitters = course.sections.map((section) => async () => {
    await mkdir(join(courseDir, section.slug));
    const sectionContentPath = join(courseDir, section.slug, "index.json");
    const sectionContent = JSON.stringify(section, null, 2);
    await writeFile(sectionContentPath, sectionContent);
  });

  await Promise.all(sectionEmitters.map((e) => e()));
};

// Input: コースのエントリーとなるディレクトリ
// Output: コースのデータ吐き出すディレクトリ
export const buildCourse = async (inputDir: string, outputDir: string) => {
  await mkdir(outputDir);

  const courseList = await collectCourseList(inputDir);

  await outputCourseListIndexJson(courseList, outputDir);

  const courseEmitters = courseList.map((course) => async () => {
    await outputCourseDetail(course, outputDir);
  });

  await Promise.all(courseEmitters.map((e) => e()));
};
