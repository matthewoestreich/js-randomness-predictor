# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.5...4.1.0) (2026-11-01)


### Features

* **node:** add solving strat for nodejs 27 ([baf80a6](https://github.com/matthewoestreich/js-randomness-predictor/commit/baf80a663d8628e66fa1430d95d9df6086370018))


### CI

* **formatting:** put each version on own line ([94de78b](https://github.com/matthewoestreich/js-randomness-predictor/commit/94de78b9e24803c8fa495a527d5a601ab7b2ae21))
* **release:** fine tune release workflow ([514ed1f](https://github.com/matthewoestreich/js-randomness-predictor/commit/514ed1f32188bf4d62d6f2937748dedaaf2b2e60))
* **tags:** fix tag ([a0b6039](https://github.com/matthewoestreich/js-randomness-predictor/commit/a0b6039f328072611a311e1a27d905294d507eef))


### Styles

* comments ([1fc1929](https://github.com/matthewoestreich/js-randomness-predictor/commit/1fc1929fb2c7d114c8af9c93fc146a51c13e22ae))


### Chores

* **deps-dev:** bump playwright from 1.64.0 to 1.64.1 ([6e5c0c0](https://github.com/matthewoestreich/js-randomness-predictor/commit/6e5c0c0af73c94019584b6f9f1ee82e4d2473790))

### [4.0.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.4...4.0.5) (2026-10-16)


### Performance Improvements

* **BigInt.asUintN:** move to asUintN vs bitwise ([c91da82](https://github.com/matthewoestreich/js-randomness-predictor/commit/c91da82362074e14570be18341d712f158a2560d))


### Documentation

* **code_of_conduct:** create ([071aa51](https://github.com/matthewoestreich/js-randomness-predictor/commit/071aa512cc3b86da7193c6a91d3d0941d07d1b59))
* **contributing_md:** create ([7add6b8](https://github.com/matthewoestreich/js-randomness-predictor/commit/7add6b850ae9ee4a135834bcf50e3d90d9b3523a))
* **contributing:** move out of README into CONTRIBUTING ([c647c22](https://github.com/matthewoestreich/js-randomness-predictor/commit/c647c2261e80a13b873cda10e474951f626919f4))
* **how_does_it_work:** clean it up ([31241b5](https://github.com/matthewoestreich/js-randomness-predictor/commit/31241b5da7530010cdf8e1f1b39198b946f7642b))
* **how_does_it_work:** clean it up ([cb95d35](https://github.com/matthewoestreich/js-randomness-predictor/commit/cb95d356c1eb0b640903152f5e5d4a566cb20c3d))
* **how_does_it_work:** clean it up ([a580d47](https://github.com/matthewoestreich/js-randomness-predictor/commit/a580d477edc5908a59efb316c5506096b28c7872))
* **how_does_it_work:** clean it up ([065e27c](https://github.com/matthewoestreich/js-randomness-predictor/commit/065e27c18854a58fd29016ddb974af16b9300a91))
* **security:** create ([2b966f2](https://github.com/matthewoestreich/js-randomness-predictor/commit/2b966f24179ffd6f10526313e341ac2fbd7cef2d))


### Tests

* **chrome_playwright:** add chrome playwright test ([0edb6ae](https://github.com/matthewoestreich/js-randomness-predictor/commit/0edb6aef4461a2d0bc93620aa1fa1c7e29093caa))
* **chrome_playwright:** add chrome playwright test ([af8a3e3](https://github.com/matthewoestreich/js-randomness-predictor/commit/af8a3e3364bbf046aba8eb75a2b150f22eae6f19))
* **chrome_playwright:** add chrome playwright test ([ea22757](https://github.com/matthewoestreich/js-randomness-predictor/commit/ea227572085a0987eaaa6382c633da11bf06c0e9))
* **chrome_playwright:** add dynamic tests via playwright ([eddac7b](https://github.com/matthewoestreich/js-randomness-predictor/commit/eddac7b9aa78e487df445689ff6dcfbd3d80530e))
* **chrome_playwright:** found oldest supported Chrome version (135) ([e9d183f](https://github.com/matthewoestreich/js-randomness-predictor/commit/e9d183f8b773b4a5cd7349f7b4151f8f657aa66e))
* **firefox_puppeteer:** cannot use playwright for firefox ([177ce3d](https://github.com/matthewoestreich/js-randomness-predictor/commit/177ce3d5e924dd361d1a83456613b64c00ab23ae))
* **node_17:** troubleshoot why test is failing ([66ff6fd](https://github.com/matthewoestreich/js-randomness-predictor/commit/66ff6fdbee2862901ce0b55cc206178eec70743c))
* **node_17:** troubleshoot why test is failing ([ac5bbb6](https://github.com/matthewoestreich/js-randomness-predictor/commit/ac5bbb6abbfd2af98032b8146bf5985668072d96))
* **node_17:** troubleshoot why test is failing ([a1fca06](https://github.com/matthewoestreich/js-randomness-predictor/commit/a1fca067cb74d349dc2a570d514f604d474f3cc1))
* **node_17:** troubleshoot why test is failing ([140d026](https://github.com/matthewoestreich/js-randomness-predictor/commit/140d026056ed5996708c96c93c9f9367a0d882cd))
* **node_17:** troubleshoot why test is failing ([0931a12](https://github.com/matthewoestreich/js-randomness-predictor/commit/0931a128a7f2b3e0ffd07bedd2d888e434f3dac7))
* **node_17:** troubleshoot why test is failing ([a289c75](https://github.com/matthewoestreich/js-randomness-predictor/commit/a289c75f717559c7ffe121531403f165f25eced4))
* **safari:** add install check incase test is run locally ([bca251e](https://github.com/matthewoestreich/js-randomness-predictor/commit/bca251e83cd48d7e244c694bd850275f5d626b18))
* **safari:** be more explicit with how we exit during error. throw error instead of process.exit ([919b9af](https://github.com/matthewoestreich/js-randomness-predictor/commit/919b9af7135bdea2c12f7463d01c47798f5d2432))
* **safari:** increase sequence ([7dfcf1c](https://github.com/matthewoestreich/js-randomness-predictor/commit/7dfcf1cd1fd669eb866f3ca64fd8a6eba6cd5fc9))


### Chores

* **deps-dev:** bump playwright from 1.63.0 to 1.64.0 ([9537b95](https://github.com/matthewoestreich/js-randomness-predictor/commit/9537b95c80c4510ffdaef2dcbf10654be38197c8))
* **deps:** bump the github-actions group with 2 updates ([8879d7b](https://github.com/matthewoestreich/js-randomness-predictor/commit/8879d7b061cc9525ec6174d510ce835bfd6dbbca))
* **deps:** npm audit fix ([4918af2](https://github.com/matthewoestreich/js-randomness-predictor/commit/4918af2fbb12a20a4ae98afade98593fc9a723a5))
* **deps:** update dev deps ([dd70601](https://github.com/matthewoestreich/js-randomness-predictor/commit/dd70601f387d2efa2e0637dd14d47928befafe75))
* **deps:** update eslint and eslint related deps ([8f72ff0](https://github.com/matthewoestreich/js-randomness-predictor/commit/8f72ff093584989ee1aae85947bb7416922c83eb))
* **deps:** upgrade vite-plugin-static-copy ([6224cab](https://github.com/matthewoestreich/js-randomness-predictor/commit/6224cab16af5f47877ead6951a50ef42fdfdb5ad))
* **gitignore:** add browser-cache/ ([85dd217](https://github.com/matthewoestreich/js-randomness-predictor/commit/85dd217870455246f5c0340e90125a4986e310da))
* **package.json:** fix node test command ([7b4a89d](https://github.com/matthewoestreich/js-randomness-predictor/commit/7b4a89ddc4ec57e5152e1a779738db76434e0c5e))
* **package.json:** remove old scripts, update doc ([8f46fe4](https://github.com/matthewoestreich/js-randomness-predictor/commit/8f46fe4568f926b3ed1864a7543421026c6d092a))
* **tests:** clean up browser tests ([b39aa0d](https://github.com/matthewoestreich/js-randomness-predictor/commit/b39aa0d62304edaa3dc5dc1b1328a7cc25cd1b49))


### Refactors

* **predictors:** use 52 and 53 bit masks for appropriate predictors ([b7a7738](https://github.com/matthewoestreich/js-randomness-predictor/commit/b7a7738038ee9f7fded1c9b3cd390cb8b5235212))
* **predictors:** use 52 and 53 bit masks for appropriate predictors ([25fb95f](https://github.com/matthewoestreich/js-randomness-predictor/commit/25fb95f8eff972267fed40db33aba4e674c5fc64))
* **predictors:** use constants for masks, etc ([215b6ee](https://github.com/matthewoestreich/js-randomness-predictor/commit/215b6eeb2c4f5c3699dc94a4c37417a7c8937d83))
* **variables:** rename variables ([4355a60](https://github.com/matthewoestreich/js-randomness-predictor/commit/4355a609e0af6b581711ac3180000fdbb7a38919))


### Styles

* change print width ([0834b1c](https://github.com/matthewoestreich/js-randomness-predictor/commit/0834b1cd7a6b85a5367ee3e48ba2780bb044e7a0))
* change print width ([dcc3206](https://github.com/matthewoestreich/js-randomness-predictor/commit/dcc32062ac00e22bff25f71d74d1da3eb2921ec3))


### CI

* **(tests:** handle exceptions and remove od node test ([fcddb77](https://github.com/matthewoestreich/js-randomness-predictor/commit/fcddb772ea63994f2f4a510c89ca74ac7d02793a))
* **(tests:** remove comment, set actions/cache to v6 ([0852c46](https://github.com/matthewoestreich/js-randomness-predictor/commit/0852c46fef452e8d31475b20da6162a9de3c04f3))
* **(tests:** remove fail fast for node matrix ([1458c74](https://github.com/matthewoestreich/js-randomness-predictor/commit/1458c74d6a035e948730a1219f4f3067a3375854))
* **(tests:** remove unnecessary async ([5565b24](https://github.com/matthewoestreich/js-randomness-predictor/commit/5565b24a47f8492d8b5cb7257d35433bf3b63eb6))
* **(tests:** simplify caching in workflow ([b1c173a](https://github.com/matthewoestreich/js-randomness-predictor/commit/b1c173a25c05cc8a69bd95125fb07d0d8b808e44))
* **(tests:** update retry fn ([2ddda7b](https://github.com/matthewoestreich/js-randomness-predictor/commit/2ddda7b56fa505f5b9297249773553b32b8f8c5d))
* **chrome:** add comment ([4d8ceda](https://github.com/matthewoestreich/js-randomness-predictor/commit/4d8ceda05c860e21d5e0e28a7d83bb45ae306e67))
* **chrome:** create gatekeeping job for chrome matrix ([2fa3c31](https://github.com/matthewoestreich/js-randomness-predictor/commit/2fa3c31ef00d327355611f08f8451b514cf16d98))
* **chrome:** create matrix ([130e256](https://github.com/matthewoestreich/js-randomness-predictor/commit/130e256206dc552b83a4d3dd9c1b8e3c50c37e10))
* **chrome:** fix cache path ([32dc182](https://github.com/matthewoestreich/js-randomness-predictor/commit/32dc182a6ba9a27b073f001d9d9915320ab3d7c6))
* **concurrency:** only allow one job to run at a time ([e19c148](https://github.com/matthewoestreich/js-randomness-predictor/commit/e19c14878df11e7289c8f10ed1f1ce9203440034))
* **dependabot:** add dependabot for GH Actions and Playwright ([22a84d0](https://github.com/matthewoestreich/js-randomness-predictor/commit/22a84d099028691d4b5ed6c2c3b4efa0b2075d54))
* **firefox:** create firefox matrix ([d96e1e6](https://github.com/matthewoestreich/js-randomness-predictor/commit/d96e1e6d0c2f076746d6ada095b413410623082d))
* **firefox:** fix firefox test ([e53917e](https://github.com/matthewoestreich/js-randomness-predictor/commit/e53917eba2cecc28781fede8f548c6854b4da8d3))
* **firefox:** rename test to check for matrix success jobs ([b8bbacb](https://github.com/matthewoestreich/js-randomness-predictor/commit/b8bbacb6950dd1f52334df5bf8efc3194925a337))
* **publish:** add publish workflow ([dd2cc36](https://github.com/matthewoestreich/js-randomness-predictor/commit/dd2cc360fb26134bf29156dbfc7a0628e7c27169))
* **safari:** use playwright to automate most recent version testing ([9b3f216](https://github.com/matthewoestreich/js-randomness-predictor/commit/9b3f2162447ca5f94f80099f8d21d499d397869d))
* **tests:** add bun/deno to path ([2d4e126](https://github.com/matthewoestreich/js-randomness-predictor/commit/2d4e12621542aed0a390aa3135e44ec4e678c14f))
* **tests:** add gatekeeping job for ruleset ([83bd253](https://github.com/matthewoestreich/js-randomness-predictor/commit/83bd253913ac3c0b532e320ad74d860a1198ea21))
* **tests:** add matrix job so we dont have to remember to update matrix values in more than one place ([3fd77bc](https://github.com/matthewoestreich/js-randomness-predictor/commit/3fd77bc568ae5c92a18e8443848c7258cdbf64b2))
* **tests:** add matrix job so we dont have to remember to update matrix values in more than one place ([f1be5a5](https://github.com/matthewoestreich/js-randomness-predictor/commit/f1be5a570cfcc523d4bf1287c31f3a6604e2d129))
* **tests:** add matrix job so we dont have to remember to update matrix values in more than one place ([ea45924](https://github.com/matthewoestreich/js-randomness-predictor/commit/ea4592494290258102d51fa4a9a3f39713e7ee0d))
* **tests:** add node rand gen, add node test matrix, add node ci test file ([75771ac](https://github.com/matthewoestreich/js-randomness-predictor/commit/75771ac5b1c4dc2dbdcc2d79b04e333748de2174))
* **tests:** cache playwright webkit binary ([6a6f2b8](https://github.com/matthewoestreich/js-randomness-predictor/commit/6a6f2b8e366a1fa26653b8fd85da4b6aac48b41e))
* **tests:** clean up node tests and npm scripts ([7252834](https://github.com/matthewoestreich/js-randomness-predictor/commit/7252834ee5d143979ff9f10e6056ba23697023e6))
* **tests:** clean up tests, dont cache browsers anymore besides safari ([9aa0fc2](https://github.com/matthewoestreich/js-randomness-predictor/commit/9aa0fc23889eb88843ed35c50f10f8360023e889))
* **tests:** fix cron schedule ([7cefcd7](https://github.com/matthewoestreich/js-randomness-predictor/commit/7cefcd7b91b72f3fe697d7dccadfffeee835cb1f))
* **tests:** fix retry logic ([b0315df](https://github.com/matthewoestreich/js-randomness-predictor/commit/b0315dfd3dda3295151dfea4e8de7a5d1a773dda))
* **tests:** forgot to add all versions to rand num gen job ([b65f1cf](https://github.com/matthewoestreich/js-randomness-predictor/commit/b65f1cfd6e60290cdf2dbd5a4d712ec2ecc86276))
* **tests:** improve retry logic ([6fec749](https://github.com/matthewoestreich/js-randomness-predictor/commit/6fec749439241e8439366ae0daedbb595dc456c9))
* **tests:** improve retry logic ([6bf0a26](https://github.com/matthewoestreich/js-randomness-predictor/commit/6bf0a26a7aaa1b63ac8e5476e82caa24be547402))
* **tests:** move launch to top level ([afc6ddb](https://github.com/matthewoestreich/js-randomness-predictor/commit/afc6ddbd21d432253653552284e194bcd6a7625b))
* **tests:** refine caching strategy for chrome and firefox ([a5f3303](https://github.com/matthewoestreich/js-randomness-predictor/commit/a5f330309aa7098c8951cb5b337b43e501ff8eb3))
* **tests:** remove old tests ([1e7a9aa](https://github.com/matthewoestreich/js-randomness-predictor/commit/1e7a9aaa53159cfc1b8d6f3f4d15255d5845c620))
* **tests:** rename job ([32b6270](https://github.com/matthewoestreich/js-randomness-predictor/commit/32b6270a1d6d821907853baa06409d8de6b4bc29))
* **tests:** restructure job order ([c350fcd](https://github.com/matthewoestreich/js-randomness-predictor/commit/c350fcda8777cd4419efea386bfa839ce47ae4c8))
* **tests:** restructure job order ([b0687c2](https://github.com/matthewoestreich/js-randomness-predictor/commit/b0687c2f98f07610648c15684c3a4d99f1e78954))
* **tests:** run safari test in container ([a075b03](https://github.com/matthewoestreich/js-randomness-predictor/commit/a075b035763f0e14c5dd5239fcb70947b9d4c8ea))
* **tests:** run safari test in container ([ae32a8c](https://github.com/matthewoestreich/js-randomness-predictor/commit/ae32a8c9c17256eb88c40d3e96e5a23054c1a2fa))
* **tests:** run safari test in container ([351860e](https://github.com/matthewoestreich/js-randomness-predictor/commit/351860e83f6d5bc5f546aac9d08c55dec0c5750d))
* **tests:** start optimizing workflow logic ([d8ad545](https://github.com/matthewoestreich/js-randomness-predictor/commit/d8ad545defe5ed7e8cdd8eacb977c653d3f315fa))
* **tests:** testing firefox ([eed0b36](https://github.com/matthewoestreich/js-randomness-predictor/commit/eed0b362cf477e2a2520b307104a51d17c9230bd))
* **tests:** testing firefox ([72e4f65](https://github.com/matthewoestreich/js-randomness-predictor/commit/72e4f65928ccd851c69025b43702dcff9c1bae1b))
* **tests:** testing safari ([5c40c68](https://github.com/matthewoestreich/js-randomness-predictor/commit/5c40c682eb1efcfef6cbb43e92cd1fa5926dd55d))
* **tests:** testing safari ([6f365df](https://github.com/matthewoestreich/js-randomness-predictor/commit/6f365dfc393e72b781bfabe620331c8f7b55d73e))
* **tests:** testing safari ([9dfa4e7](https://github.com/matthewoestreich/js-randomness-predictor/commit/9dfa4e7707a64eebb7b93099b9ebe8eda796294b))
* **tests:** testing safari ([2284aea](https://github.com/matthewoestreich/js-randomness-predictor/commit/2284aeae383dd07e14d95823d2ced09f3196486c))
* **tests:** troubleshoot ([40b4c7e](https://github.com/matthewoestreich/js-randomness-predictor/commit/40b4c7e4e100b6ea9d084289fdb09a8030f796c3))
* **tests:** troubleshoot cli ([6520684](https://github.com/matthewoestreich/js-randomness-predictor/commit/6520684f5f6a58e2ea23cbe23913a67e2c80b4c7))
* **tests:** troubleshoot cli ([c4593fa](https://github.com/matthewoestreich/js-randomness-predictor/commit/c4593faf627a93393f95022bb2fe67675dbecd7f))
* **tests:** troubleshoot schedule ([ee7e02b](https://github.com/matthewoestreich/js-randomness-predictor/commit/ee7e02b63b69a93e93de707fbfa39269208634b8))
* **tests:** troubleshoot schedule ([f55c545](https://github.com/matthewoestreich/js-randomness-predictor/commit/f55c545da0d036ebc79e422fd6440028dd51acdd))
* **tests:** troubleshoot schedule ([4065c3f](https://github.com/matthewoestreich/js-randomness-predictor/commit/4065c3fd34061cecb690204d7286487baeb2790f))
* **tests:** troubleshoot schedule ([06ce4dc](https://github.com/matthewoestreich/js-randomness-predictor/commit/06ce4dc554adf0220f4e850fe9da19ff43abebe8))
* **tests:** troubleshoot schedule ([cf769f9](https://github.com/matthewoestreich/js-randomness-predictor/commit/cf769f9ef777c7594758e31f0b9dd8783f3af609))
* **tests:** troubleshoot schedule ([42f40dd](https://github.com/matthewoestreich/js-randomness-predictor/commit/42f40ddec32491cbc809b81bed5eb7406bf99f62))
* **tests:** upgrade actions versions ([c29358f](https://github.com/matthewoestreich/js-randomness-predictor/commit/c29358f14557b0eae86bcd2be41309785d6ceef1))
* **workflow:** instead of testing all browsers in a single job, create a job per browser ([2985c54](https://github.com/matthewoestreich/js-randomness-predictor/commit/2985c54ff4cadfd31b65e7172e49ac882e7bc605))
* **workflows:** rename old workflow file to txt. keeping it for now to use as a reference ([1509b6b](https://github.com/matthewoestreich/js-randomness-predictor/commit/1509b6b04cd4039c0f7d57b976023a816c98c504))
* **workflows:** separate tests and release workflows, clean up release workflow ([10630a3](https://github.com/matthewoestreich/js-randomness-predictor/commit/10630a3880339fd29bb7da358137396f0202fae7))

### [4.0.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.3...4.0.4) (2026-10-04)


### Bug Fixes

* **chrome:** support new V8 Math.random forward state progression ([ce8ff9a](https://github.com/matthewoestreich/js-randomness-predictor/commit/ce8ff9ad21c396da3341da5e711abb984d5968d2))

### [4.0.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.2...4.0.3) (2026-10-04)


### Bug Fixes

* **V8:** support new forward Math.random state progression ([256472f](https://github.com/matthewoestreich/js-randomness-predictor/commit/256472fef395c3ce0892e777ee08acb1dc9981a9))


### Chores

* **comments:** add/move comments ([a7d461c](https://github.com/matthewoestreich/js-randomness-predictor/commit/a7d461c89faf10e19383589937c1e20d670579c9))

### [4.0.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.1...4.0.2) (2026-06-20)


### Documentation

* **readme:** major cleanup ([44e2fff](https://github.com/matthewoestreich/js-randomness-predictor/commit/44e2fff72ab9386dde52e7ec23060f0c5ef6b41f))

### [4.0.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/4.0.0...4.0.1) (2026-06-20)


### Documentation

* **readme:** major cleanup ([857ad38](https://github.com/matthewoestreich/js-randomness-predictor/commit/857ad3896d013da1d543b2a4caf55a993d1c2974))
* **readme:** major cleanup ([f9c0eab](https://github.com/matthewoestreich/js-randomness-predictor/commit/f9c0eabe288708d26354b1afaed96df08bd27d99))
* **readme:** major cleanup ([9e519f0](https://github.com/matthewoestreich/js-randomness-predictor/commit/9e519f0f17e54a0bcfe30464918d8095152f70e3))
* **readme:** major cleanup ([e8e0977](https://github.com/matthewoestreich/js-randomness-predictor/commit/e8e0977af1eb00c9df874fb898ae29446b3119c8))
* **readme:** major cleanup ([c60acb8](https://github.com/matthewoestreich/js-randomness-predictor/commit/c60acb88e52a11fc7a31470ca355b2ed3b1f2e8c))
* **readme:** major cleanup ([0b9201c](https://github.com/matthewoestreich/js-randomness-predictor/commit/0b9201c214b482b1e3ce48a69978d262dced3053))
* **readme:** major cleanup ([385f145](https://github.com/matthewoestreich/js-randomness-predictor/commit/385f145c06fd238d67dd7258bc0d8d2b1c20cebd))
* **readme:** major cleanup ([08c5a1f](https://github.com/matthewoestreich/js-randomness-predictor/commit/08c5a1f69299ca64956655dc637e411765747a29))
* **readme:** major cleanup ([bc9c080](https://github.com/matthewoestreich/js-randomness-predictor/commit/bc9c08028ee975b9ee26834647654bd36437bc91))
* **readme:** major cleanup ([6a3956e](https://github.com/matthewoestreich/js-randomness-predictor/commit/6a3956eb26819f17bd62d2e40f7261b7fa2693cd))

## [4.0.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.6.0...4.0.0) (2026-06-20)


### ⚠ BREAKING CHANGES

* Remove node version requirement
* **node:** to support automatic version detection, the recommended initial sequence length for Node.js has increased from **4** to **5** values
* **node_predictor:** remove node version requirement. this removes the '--env-version' (or '-v' shorthand) within the CLI, as well as the 'setNodeVersion' method on the Node predictor. Also removed various types and constants in regards to node version. We now automatically attempt various solving strategies behind the scenes, which cover all nodejs versions, so now it is transparent to the end user, which should make using this library/cli easier.

### CI

* **node:** add Node.js v25.x to be explicitly tested, use "node" for latest version (26) ([d17201b](https://github.com/matthewoestreich/js-randomness-predictor/commit/d17201be8611f3a16001eddb88bfe7f30db025e4))


### Refactors

* **node_predictor:** remove node version requirement ([0729bef](https://github.com/matthewoestreich/js-randomness-predictor/commit/0729befc276ca725fa158be0131aeb30b11c3f5a))
* **node:** have to increase initial sequence size ([9e2bac4](https://github.com/matthewoestreich/js-randomness-predictor/commit/9e2bac4d30bfe6ccd685540dd13845487b2689cd))


### Tests

* **node:** fix initial sequence length; increase from 4 to 5 in test ([3ab0741](https://github.com/matthewoestreich/js-randomness-predictor/commit/3ab074121a2aba9f04e2c7d8e6624352981dbfaa))
* **node:** fix legacy tests ([58328aa](https://github.com/matthewoestreich/js-randomness-predictor/commit/58328aadbc4ab379bac750f4b09a2cca6bd7626f))
* **node:** troubleshoot flaky test ([9297d4b](https://github.com/matthewoestreich/js-randomness-predictor/commit/9297d4b18b7d267fb1e3ce95f106fb52d1ecf036))
* **node:** troubleshoot flaky test ([4c79d92](https://github.com/matthewoestreich/js-randomness-predictor/commit/4c79d92dd70f35a6740905b90c5bc9d23b2e6f29))


### Documentation

* **readme:** update readme ([6e6f8f1](https://github.com/matthewoestreich/js-randomness-predictor/commit/6e6f8f14aef507e950af45e2c1f17fae792df62b))
* **README:** update readme ([bec8449](https://github.com/matthewoestreich/js-randomness-predictor/commit/bec8449ab57859ce20c5fa58f232e6e530f50a1a))
* **README:** update README ([efac5df](https://github.com/matthewoestreich/js-randomness-predictor/commit/efac5dfacea23c0dc95a058df40ee2e2b2ab9da5))


* Merge pull request #29 from matthewoestreich/remove-node-version-requirement ([458bf42](https://github.com/matthewoestreich/js-randomness-predictor/commit/458bf424b373704433cfae3e5c40ee87b1b8b267)), closes [#29](https://github.com/matthewoestreich/js-randomness-predictor/issues/29)

## [3.6.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.5.0...3.6.0) (2026-05-06)


### ⚠ BREAKING CHANGES

* **cli and types:** rename exported type BrowserRuntimeType to BrowserRuntime

### Features

* **node:** add new V8 algo to Node v26.x.x predictor ([f888a53](https://github.com/matthewoestreich/js-randomness-predictor/commit/f888a53f7d47ecb0651ae50dd190bd1436e91adc))
* **node:** add Node.js v26 support ([3781613](https://github.com/matthewoestreich/js-randomness-predictor/commit/378161326f5e2d68b64860c6780c18f3d9b6dedf))
* **node:** add Node.js v26 to supported versions ([bfdc2cf](https://github.com/matthewoestreich/js-randomness-predictor/commit/bfdc2cf65af2b55ad76f52918f6a4fec02492691))


### Build System

* **docs:** create README in build to document build workflow; add comment to vite config ([06a9361](https://github.com/matthewoestreich/js-randomness-predictor/commit/06a936195d704774eff234bdec52eee46667f333))


### Refactors

* **cli and types:** convert parsed execution runtime string as ServerRuntim; remove Type prefix from types ([276f7f4](https://github.com/matthewoestreich/js-randomness-predictor/commit/276f7f48fcf821b044b70c5816ea4622e186111e))
* **cli and types:** convert parsed execution runtime string as ServerRuntim; remove Type prefix from types\n\nBREAKING CHANGE: rename exported type BrowserRuntimeType to BrowserRuntime ([0224c22](https://github.com/matthewoestreich/js-randomness-predictor/commit/0224c22144b62892f8e570a89a0c3afb86a640af))
* **cli:** clean up logic; add comment ([930cdf8](https://github.com/matthewoestreich/js-randomness-predictor/commit/930cdf8fb2204014e3109e18639b19698ead4452))
* **cli:** clean up logic; add comment ([2c3af09](https://github.com/matthewoestreich/js-randomness-predictor/commit/2c3af092d9b70968914ebe5e6b16a76f8f563506))
* **cli:** merge all cli code into single file; update tests ([bf6885f](https://github.com/matthewoestreich/js-randomness-predictor/commit/bf6885fc7066fdfefb2ac2fe434114a52aa166c7))

## [3.5.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.4.8...3.5.0) (2026-04-01)


### Performance Improvements

* **cli:** if execution runtime is node, no need to create child process ([88a4c91](https://github.com/matthewoestreich/js-randomness-predictor/commit/88a4c91d638f2dfa9dc57572f534c436a9281ce3))


### Chores

* **standard-version:** include more types in changelog ([0199acb](https://github.com/matthewoestreich/js-randomness-predictor/commit/0199acb72204822341182778e7c7ee73ff883cb7))


### Tests

* **cli:** rename assertProcessStatus methods ([10544d9](https://github.com/matthewoestreich/js-randomness-predictor/commit/10544d97176d4eca5f807db854865354ddac507a))


### Refactors

* **cli:** add explicit return type to buildCli ([15abce7](https://github.com/matthewoestreich/js-randomness-predictor/commit/15abce7c4d45e57431f2abe77005df6280a2e62d))
* **cli:** early process exit if node; explicitly throw errs from yargs ([ce71232](https://github.com/matthewoestreich/js-randomness-predictor/commit/ce7123248f1aedcd31402d4a4c8786acc7a9b3aa))
* **cli:** if execution runtime is node, there is no need to spawn child process ([d956e92](https://github.com/matthewoestreich/js-randomness-predictor/commit/d956e925c81afd198c06f8b3d463d7ea5da78d4d))
* **cli:** if execution runtime is node, there is no need to spawn child process ([9cfe9a2](https://github.com/matthewoestreich/js-randomness-predictor/commit/9cfe9a27c8585d6c61768b34822b19923274c0c4))
* **cli:** rename files to better reflect purpose; use env var as flag to check if lib behaves as main; general cleanup ([09aab61](https://github.com/matthewoestreich/js-randomness-predictor/commit/09aab616397062a4a1f957675c68ca5f450f64c1))

### [3.4.8](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.4.7...3.4.8) (2026-03-31)

### [3.4.7](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.4.6...3.4.7) (2026-03-30)

### [3.4.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.4.5...3.4.6) (2026-03-30)


### Features

* **cli:** add runtime to output ([149ea9e](https://github.com/matthewoestreich/js-randomness-predictor/commit/149ea9efbe032572e4d3f40e2f4b4e92f3ae78d2))

### [3.4.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.4.4...3.4.5) (2026-03-30)


### Features

* **test:** ignore me ([52b263c](https://github.com/matthewoestreich/js-randomness-predictor/commit/52b263ce41d2ba795857266fbd64744e5528958d))

### 3.4.4 (2026-03-30)

### 3.4.3 (2026-03-30)

### 3.4.2 (2026-03-30)

### 3.4.1 (2026-03-30)

# [3.4.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.3.2...3.4.0) (2026-03-30)

## [3.3.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.3.1...3.3.2) (2026-02-26)

## [3.3.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.3.0...3.3.1) (2026-02-01)

# [3.3.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.32...3.3.0) (2025-11-25)

## [3.2.32](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.31...3.2.32) (2025-10-07)

## [3.2.31](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.30...3.2.31) (2025-10-07)

## [3.2.30](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.29...3.2.30) (2025-10-07)

## [3.2.29](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.28...3.2.29) (2025-10-07)

## [3.2.28](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.27...3.2.28) (2025-10-07)

## [3.2.27](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.26...3.2.27) (2025-10-07)

## [3.2.26](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.25...3.2.26) (2025-10-07)

## [3.2.25](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.24...3.2.25) (2025-10-07)

## [3.2.24](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.23...3.2.24) (2025-10-06)

## [3.2.23](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.22...3.2.23) (2025-10-06)

## [3.2.22](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.21...3.2.22) (2025-10-06)

## [3.2.21](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.20...3.2.21) (2025-10-06)

## [3.2.20](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.19...3.2.20) (2025-10-04)

## [3.2.19](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.18...3.2.19) (2025-10-04)

## [3.2.18](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.17...3.2.18) (2025-10-04)

## [3.2.17](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.16...3.2.17) (2025-10-04)

## [3.2.16](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.15...3.2.16) (2025-10-04)

## [3.2.15](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.14...3.2.15) (2025-10-04)

## [3.2.14](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.10...3.2.14) (2025-10-04)

## [3.2.10](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.9...3.2.10) (2025-10-03)

## [3.2.9](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.8...3.2.9) (2025-10-03)

## [3.2.8](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.7...3.2.8) (2025-10-03)

## [3.2.7](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.6...3.2.7) (2025-10-03)

## [3.2.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.5...3.2.6) (2025-10-03)

## [3.2.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.4...3.2.5) (2025-10-03)

## [3.2.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.3...3.2.4) (2025-10-02)

## [3.2.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.2...3.2.3) (2025-10-02)

## [3.2.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.1...3.2.2) (2025-10-02)

## [3.2.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.2.0...3.2.1) (2025-10-02)

# [3.2.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.1.4...3.2.0) (2025-10-02)

## [3.1.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.1.3...3.1.4) (2025-09-29)

## [3.1.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.1.2...3.1.3) (2025-09-28)

## [3.1.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.1.1...3.1.2) (2025-09-28)

## [3.1.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.1.0...3.1.1) (2025-09-28)

# [3.1.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/3.0.0...3.1.0) (2025-09-28)

# [3.0.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.6...3.0.0) (2025-09-27)

## [2.4.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.5...2.4.6) (2025-09-27)

## [2.4.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.4...2.4.5) (2025-09-26)

## [2.4.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.3...2.4.4) (2025-09-26)

## [2.4.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.2...2.4.3) (2025-09-24)

## [2.4.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.1...2.4.2) (2025-09-24)

## [2.4.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.4.0...2.4.1) (2025-09-24)

# [2.4.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.3.1...2.4.0) (2025-09-24)

## [2.3.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.3.0...2.3.1) (2025-09-23)

# [2.3.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.2.1...2.3.0) (2025-09-23)

## [2.2.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.2.0...2.2.1) (2025-09-22)

# [2.2.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.1.3...2.2.0) (2025-09-22)

## [2.1.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.1.2...2.1.3) (2025-09-20)

## [2.1.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.1.1...2.1.2) (2025-09-16)

## [2.1.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.1.0...2.1.1) (2025-09-16)

# [2.1.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.0.1...2.1.0) (2025-09-16)

## [2.0.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/2.0.0...2.0.1) (2025-09-09)

# [2.0.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.6...2.0.0) (2025-07-28)

## [1.5.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.5...1.5.6) (2025-07-17)

## [1.5.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.4...1.5.5) (2025-07-05)

## [1.5.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.3...1.5.4) (2025-07-05)

## [1.5.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.2...1.5.3) (2025-07-05)

## [1.5.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.1...1.5.2) (2025-07-05)

## [1.5.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.5.0...1.5.1) (2025-07-04)

# [1.5.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.4.0...1.5.0) (2025-07-04)

# [1.4.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.6...1.4.0) (2025-06-25)

## [1.3.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.5...1.3.6) (2025-06-25)

## [1.3.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.4...1.3.5) (2025-06-25)

## [1.3.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.3...1.3.4) (2025-06-25)

## [1.3.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.2...1.3.3) (2025-06-25)

## [1.3.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/1.3.1...1.3.2) (2025-06-25)

## [1.3.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.3.0...1.3.1) (2025-06-25)

# [1.3.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.2.2...v1.3.0) (2025-06-25)

## [1.2.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.2.1...v1.2.2) (2025-06-22)

## [1.2.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.2.0...v1.2.1) (2025-06-22)

# [1.2.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.6...v1.2.0) (2025-06-19)

## [1.1.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.5...v1.1.6) (2025-06-18)

## [1.1.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.4...v1.1.5) (2025-06-18)

## [1.1.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.3...v1.1.4) (2025-06-18)

## [1.1.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.2...v1.1.3) (2025-06-18)

## [1.1.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.1...v1.1.2) (2025-06-18)

## [1.1.1](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.1.0...v1.1.1) (2025-06-18)

# [1.1.0](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.12...v1.1.0) (2025-06-17)

## [1.0.12](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.11...v1.0.12) (2025-06-17)

## [1.0.11](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.10...v1.0.11) (2025-06-17)

## [1.0.10](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.9...v1.0.10) (2025-06-17)

## [1.0.9](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.8...v1.0.9) (2025-06-17)

## [1.0.8](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.7...v1.0.8) (2025-06-16)

## [1.0.7](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.6...v1.0.7) (2025-06-16)

## [1.0.6](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.5...v1.0.6) (2025-06-16)

## [1.0.5](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.4...v1.0.5) (2025-06-16)

## [1.0.4](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.3...v1.0.4) (2025-06-16)

## [1.0.3](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.2...v1.0.3) (2025-06-16)

## [1.0.2](https://github.com/matthewoestreich/js-randomness-predictor/compare/v1.0.1...v1.0.2) (2025-06-16)

## 1.0.1 (2025-06-16)
