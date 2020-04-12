#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const program = require('commander')
const { version } = require('../package')

const getDefaultParams = require('./get-default-params')
const create = require('./create')
const promptParams = require('./prompt-params')

module.exports = async () => {
  const defaults = await getDefaultParams()

  program
    .name('create-electron-react')
    .version(version)
    .usage('[options] [application-name]')
    .option('-a, --author <string>', 'author', defaults.author)
    .option('-d, --desc <string>', 'project description', defaults.description)
    .option('-i, --id <string>', 'application id', defaults.app_id)
    .option('-v, --version <string>', 'application version', defaults.version)
    .option('-g, --no-git', 'generate without git init')
    .option(
      '-m, --manager <npm|yarn>',
      'package manager to use',
      /^(npm|yarn)$/,
      defaults.manager
    )
    .option(
      '-t, --template <default|typescript>',
      'package template to use',
      /^(default|typescript|custom)$/,
      defaults.template
    )
    .option('-p, --template-path <string>', 'custom package template path')
    .option(
      '-s, --skip-prompts',
      'skip all prompts (must provide application-name via cli)'
    )
    .parse(process.argv)

  const opts = {
    author: program.author,
    app_id: program.app_id,
    version: program.version,
    description: program.desc,
    manager: program.manager,
    template: program.template,
    templatePath: program.templatePath,
    skipPrompts: program.skipPrompts,
    git: program.git
  }

  Object.keys(opts).forEach(key => {
    if (!opts[key] && defaults[key]) {
      opts[key] = defaults[key]
    }
  })

  if (program.args.length === 1) {
    opts.name = program.args[0]
  } else if (program.args.length > 1) {
    console.error('invalid arguments')
    program.help()
    process.exit(1)
  }

  const params = await promptParams(opts)
  const dest = await create(params)

  console.log(`
All set. Welcome to your new electron-react project!

Your Application has been created at ${dest}.

To get started, run:
$ ${chalk.cyan(`cd ${params.shortName} && ${params.manager} run dev`)}

`)

  return dest
}

module.exports().catch(err => {
  console.error(err)
  process.exit(1)
})
