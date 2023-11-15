const esbuild = require('esbuild')
const esbuildConfig = {
  entryPoints: [
      'src/**/**/**/**/**/**/*.ts',
      'src/**/**/**/**/**/*.ts',
      'src/**/**/**/**/*.ts',
      'src/**/**/**/*.ts',
      'src/**/**/*.ts',
      'src/**/*.ts',
      'src/*.ts',
  ],
  bundle: true,
  minify: true,
  external: ['aws-sdk'],
  sourcemap: true,
  target: 'es2015',
  platform: 'node',
  outdir: 'dist',
}

esbuild.build(esbuildConfig).catch(() => process.exit(1))
