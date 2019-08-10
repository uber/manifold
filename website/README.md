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