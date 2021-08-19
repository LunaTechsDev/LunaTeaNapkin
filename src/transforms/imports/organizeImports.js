import ts from 'typescript';
import { writeFile, unlink } from 'fs.promises';

import ServiceHost from './ServiceHost';
import applyTextChanges from './applyTextChanges'

export default async function organizeImports(code) {
  try {
    const fileName = `${process.cwd()}/temp.js`

    await writeFile(fileName, code, "utf8");
    console.log('file written, SUCESSS!');

    const languageService = ts.createLanguageService(new ServiceHost(fileName, code));
    const fileChanges = languageService.organizeImports({
      type: 'file',
      fileName
    }, {}, {})[0];

    await unlink(fileName)

    return fileChanges ? applyTextChanges(code, fileChanges.textChanges) : code;
  } catch (error) {
    throw new Error(error.message);
  }
}