const { makeMetroConfig } = require('@rnx-kit/metro-config')
const { resolve } = require('path')

module.exports = makeMetroConfig({
  resolver: {
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
    resolveRequest(context, moduleName, platform) {
      if (moduleName === '@react-three/uikit') {
        return {
          filePath: resolve(__dirname, '../../packages/uikit/dist/index.js'),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform)
    }
  },
  watchFolders: [resolve(__dirname, '../..')]
})
