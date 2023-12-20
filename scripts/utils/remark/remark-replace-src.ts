import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import type { Root } from "mdast";
import { replaceSrc } from "../replace";

const remarkReplaceSrc: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "image") {
        node.url = replaceSrc(node.url);
      }
    });
  };
};

export default remarkReplaceSrc;
