## Table of content

- [Developing package](#developing-package)
- [Developing website](#developing-website)

# Developing package

`/modules/manifold` contains the content of Manifold package, and `/example/manifold` is the playground where you can develop the package.

## Run example locally

In root directory:

```sh
yarn install
```

In `/example/manifold` directory:

```sh
yarn install
yarn start
```

All changes made in `/modules/manifold` or other packages that are used in Manifold (e.g. `/modules/feature-list-view`) will be hot-loaded while you are running `/example/manifold` locally.

## Deploy package

After finishing developing the package and after merging the pull request into `master`, you can deploy it to on npm.

In root directory, on `master` branch:

```sh
yarn bump
```

Then choose the version number you'd like to deploy.

Still in root directory:

```sh
git push origin master
```

And travis CI will automatically deploy the newest version to npm.

# Developing website

`/website/src/` contains the content of Manifold [website](https://uber.github.io/manifold/), which can be bundled and copied to gh-pages branch for deployment.

## Run website locally

In root directory:

```sh
yarn install:all  # or `yarn install:web` if you have already installed in root directory
```

In `/website` directory:

```sh
yarn start
```

## Deploy website

After finishing developing the website, you can deploy it to gh-pages.

In root directory:

```sh
yarn deploy
```

This will bundle the website into `/website/dist` directory, copy the content in `/website/dist` to the root of `gh-pages` branch, and push ro remote `gh-pages` branch (so that it is accessible through Manifold [website](https://uber.github.io/manifold/))

## Include a demo example in the website

Import the example from the `/examples` folder and add to the website. E.g.:

In `/website/src/main.js`:

```js
import Demo from '../../examples/manifold/src/app';

const Root = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={Demo} />
    </BrowserRouter>
  </Provider>
);
```
