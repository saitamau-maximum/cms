import { CMS_ORIGIN } from "../config";

// /public -> https://saitamau-maximum.github.io/cms/public
export const replaceSrc = (src: string) => {
  return src.replace(/^\/public/, CMS_ORIGIN + "/public");
};

