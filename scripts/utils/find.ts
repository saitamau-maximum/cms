import { readdir, stat } from "fs/promises";
import { join } from "path";

// 指定したディレクトリ内のファイルを再帰的に検索して、最初に`fileName`と一致するファイルのパスを返します。
// 見つからない場合は`null`を返します。
// `filter`を指定した場合は、`filter`で指定した条件に一致するファイルを対象とします。
export const findFileDeep = async (
  dir: string,
  fileName: string,
  filter?: (path: string) => boolean
): Promise<string | null> => {
  const files = await readdir(dir);
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    if (stats.isDirectory()) {
      const result = await findFileDeep(path, fileName, filter);
      if (result) {
        return result;
      }
    } else if (stats.isFile()) {
      if (file === fileName) {
        if (filter) {
          if (filter(path)) {
            return path;
          }
        } else {
          return path;
        }
      }
    }
  }
  return null;
};

// 指定したディレクトリ内のファイルを再帰的に検索して、`filter`で指定した条件に一致するファイルのパスの配列を返します。
// `filter`を指定しない場合は、全てのファイルを対象とします。
export const getFilesDeep = async (
  dir: string,
  filter?: (path: string) => boolean
): Promise<string[]> => {
  const files = await readdir(dir);
  const result: string[] = [];
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    if (stats.isDirectory()) {
      const files = await getFilesDeep(path, filter);
      result.push(...files);
    } else if (stats.isFile()) {
      if (filter) {
        if (filter(path)) {
          result.push(path);
        }
      } else {
        result.push(path);
      }
    }
  }
  return result;
};

// 指定したディレクトリ内のファイルリストを取得し、`ext`で指定した拡張子のファイルのパスの配列を返します。
// `ext`を指定しない場合は、全てのファイルを対象とします。
export const getFiles = async (
  dir: string,
  filter?: (path: string) => boolean
): Promise<string[]> => {
  const files = await readdir(dir);
  const result: string[] = [];
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    if (stats.isFile()) {
      if (filter) {
        if (filter(path)) {
          result.push(path);
        }
      } else {
        result.push(path);
      }
    }
  }
  return result;
};

// 指定したディレクトリ内のディレクトリリストを取得します。
export const getDirectories = async (dir: string): Promise<string[]> => {
  const files = await readdir(dir);
  const result: string[] = [];
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    if (stats.isDirectory()) {
      result.push(path);
    }
  }
  return result;
};

// 指定したパスからファイル名を取得します。
// `ext`を指定した場合は、拡張子を含めて返します。
export const getFileName = (path: string, ext = false): string => {
  const fileName = path.split("/").pop()!;
  if (ext) {
    return fileName;
  } else {
    return fileName.split(".").shift()!;
  }
};

// 指定したパスからディレクトリ名を取得します。
export const getDirectoryName = (path: string): string => {
  if (path.endsWith("/")) {
    path += "dummy";
  }
  const split = path.split("/");
  return split[split.length - 2] || "";
};
