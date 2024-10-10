import { select } from '@inquirer/prompts'
import { join } from 'node:path'
import { listItems } from './fileHandling.js'
import { clearPreviousPromptLines } from './cliUtils.js'

export async function chooseItems({
    currentPath,
    includeFiles = false,
}: {
  currentPath: string;
  includeFiles?: boolean;
}): Promise<string> {
    async function prompt(srcPath: string): Promise<string> {
        const promptMessage = `Please choose the Visual Testing output.json file (current folder: ${srcPath})`
        const choices = listItems({ folderPath: srcPath, includeFiles })
        const answers = await select({
            message: promptMessage,
            choices: choices,
        })
        const newPath = join(srcPath, answers)

        if (
            (answers === '..' || answers.endsWith('/')) &&
      !answers.startsWith('selected-folder:')
        ) {
            clearPreviousPromptLines(promptMessage)
            return prompt(newPath)
        } else if (answers.startsWith('selected-folder:')) {
            return answers.split(':')[1]
        }

        return newPath
    }

    return prompt(currentPath)
}
