'use strict'

const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')

const config = require('./config')

module.exports = async opts => {
  if (opts.skipPrompts) {
    if (!opts.name) {
      throw new Error(
        'invalid input; you must pass a Application Name with --skip-prompts'
      )
    }

    Object.keys(opts).forEach(key => {
      const value = opts[key]
      if (typeof value === 'function') {
        opts[key] = value(opts)
      }
    })

    return opts
  } else {
    const info = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Application Name',
        validate: name => {
          return !!name
        },
        default: opts.name
      },
      {
        type: 'input',
        name: 'app_id',
        message: 'Application Id',
        default: opts.app_id
      },
      {
        type: 'input',
        name: 'version',
        message: 'Application Version',
        default: opts.version
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project Description',
        default: opts.description
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author',
        default: opts.author
      },
      {
        type: 'list',
        name: 'manager',
        message: 'Package Manager',
        choices: ['npm', 'yarn'],
        default: opts.manager
      },
      {
        type: 'list',
        name: 'template',
        message: 'Template',
        choices: ['default', 'typescript', 'custom'],
        default: opts.template
      },
      {
        type: 'list',
        name: 'mirror',
        message: 'Select Mirror',
        choices: ['default', 'taobao'],
        default: opts.mirror
      },
      {
        type: 'input',
        name: 'templatePath',
        message: 'Template Path',
        default: opts.templatePath,
        when: ({ template }) => template === 'custom',
        validate: input =>
          new Promise(resolve => {
            const fullPath = path.resolve(process.cwd(), input)
            fs.stat(fullPath, (err, stats) => {
              if (err) {
                return resolve(`Cannot resolve directory at: ${fullPath}`)
              }
              resolve(true)
            })
          })
      }
    ])

    config.set('author', info.author)
    config.set('manager', info.manager)
    config.set('template', info.template)

    return {
      ...info,
      git: opts.git
    }
  }
}
