import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remark2rehype from "remark-rehype";
import remarkReplaceSrc from "./remark/remark-replace-src";
import rehypeStringify from "rehype-stringify";

// Markdown 形式の文字列を受け取って、HTML 形式の文字列を返す
export const markdownToHtml = async (markdown: string) => {
  const result = await unified()
    .use(remarkParse) // markdown -> mdast の変換
    .use(remarkGfm) // GFM に対応
    .use(remarkReplaceSrc) // hast の変換
    .use(remark2rehype) // mdast -> hast の変換
    .use(rehypeStringify) // hast -> html の変換
    .process(markdown);
  return result.toString();
};
