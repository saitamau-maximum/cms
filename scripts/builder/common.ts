import { z } from "zod";
import { load } from "js-yaml";

export class BuilderError extends Error {
  path: string;

  constructor(message: string, path: string) {
    super(message);
    this.name = "BuilderError";
    this.path = path;
  }
}

const Errors = {
  FrontMatter: {
    NotFound: (path: string) =>
      new BuilderError("Frontmatterが見つかりませんでした。", path),
    NotValidYaml: (path: string) =>
      new BuilderError("Frontmatterが正しいYAMLではありません。", path),
    Invalid: (path: string) =>
      new BuilderError("Frontmatterの内容が不正です。", path),
  },
  Content: {
    Blank: (path: string) => new BuilderError(`コンテンツが空です。`, path),
  },
};

export const validateAndParseMarkdown = <T extends z.ZodObject<any>>(
  text: string,
  path: string,
  frontMatterSchema: T
): {
  frontmatter: z.infer<T>;
  content: string;
} => {
  const [, frontMatter, ...contents] = text.split("---");
  if (!frontMatter) {
    throw Errors.FrontMatter.NotFound(path);
  }

  let data: unknown;
  try {
    data = load(frontMatter);
  } catch (e) {
    throw Errors.FrontMatter.NotValidYaml(path);
  }

  const result = frontMatterSchema.safeParse(data);
  if (!result.success) {
    throw Errors.FrontMatter.Invalid(path);
  }

  const content = contents.join("---").trim();
  if (!content) {
    throw Errors.Content.Blank(path);
  }

  return {
    frontmatter: result.data,
    content,
  };
};
