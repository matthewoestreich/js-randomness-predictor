# Building JSRP

## Build Script

We use a custom build script, `runCommands.js` (at root of `/build` folder) that accepts a JSON file as an argument. I wound up doing this because the `npm` scripts in `package.json` were becoming very long and hard to read/reason about.

### JSON Data Shape

The JSON file should contain an array of `npm` commands to run, along with a description of what the command does.

```
[
  { "command": "npm run foo", "description": "This command is meant to do xyz." },
  { "command": "npm run bar", "description": "This command is meant to do abc." }
]
```

### Usage

The path to the JSON file should be relative to the working directory where the script is being called from.

```
node runCommands.js ./commands.json
```

## Backend

This is the backend build workflow (in order):

1. Run `tsc` to transpile into `~/dist/staging/` folder
2. Run `rollup` to minify into `~/dist/<build_type>/` folder, where `<build_type>` is `esm`, `cjs`, etc..
3. Remove the now empty `staging` folder
4. Run `postbuild.cjs`, which among other tasks, copies needed files, creates `package.json` files, etc..

## Frontend

1. Run `vite` to transpile and minify
2. Does not use a `staging` directory
