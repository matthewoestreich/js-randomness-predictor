Now you can just do:

```bash
# Publish new major version and push to main branch
npm run publish:main:major
# Publish new minor version and push to main branch
npm run publish:main:minor
# Publish new patch version and push to main branch
npm run publish:main:patch
```

THESE ARE THE OLD STEPS

```bash
# login
npm login
# make sure changes are built
npm run build
# increment version
# options are: (from-git|major|minor|patch|premajor|preminor|prepatch|prerelease)
npm version patch
# Publish changes
npm publish
```
