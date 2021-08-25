import ts from 'typescript';
import { writeFile } from 'fs.promises';

import temp from 'temp'

import ServiceHost from './ServiceHost';
import applyTextChanges from './applyTextChanges'

temp.track();

export default async function organizeImports(code) {
  try {
    const fileName = temp.openSync({ suffix: '.js' }).path

    await writeFile(fileName, code, "utf8");

    const languageService = ts.createLanguageService(new ServiceHost(fileName, code));
    const fileChanges = languageService.organizeImports({
      type: 'file',
      fileName
    }, {}, {})[0];

    await temp.cleanup();
    return fileChanges ? applyTextChanges(code, fileChanges.textChanges) : code;
  } catch (error) {
    throw new Error(error.message);
  }
}