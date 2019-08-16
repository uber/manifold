# Contributing to Manifold

Great to have you here. Here are a few ways you can help make manifold even better!

Note that you'll need to sign [Uber's Contributor License Agreement][cla]
before we can accept any of your contributions.

* [Code of Conduct](#coc)
* [Issues and Bugs](#issue)
* [Feature Requests](#feature)
* [Improving Documentation](#docs)
* [Submitting Pull Request](#submit-pr)

## <a name="coc"></a> Code of Conduct
Help us keep manifold open and inclusive. Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## <a name="issue"></a> Issues and Bugs
If you find a bug, you can help us by submitting an [Issue][git-iss] to our GitHub Repository. Even better, you can submit a [Pull Request][git-pr] with a fix.

## <a name="feature"></a> Feature Requests

If you want to contribute or add new features, please use [Issue][git-iss] on github projects to start a new discussion. If you receive a Go ahead, you can submit your patch as PR to the repository.

## <a name="submit-pr"></a> Submitting Pull Request

* Search [GitHub][git-pr] for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.
* Create the development environment
* Make your changes in a new git branch:

    ```shell
    git checkout -b my-fix-branch master
    ```

* Create your patch commit, **including appropriate test cases**.
* If the changes affect public APIs, change or add relevant documentation.
* Run tests and ensure that all tests pass.
* Commit your changes using a descriptive commit message. Adherence to the conventions is required, because release notes are automatically generated from these messages.
* All pull requests will be reviewed by @uber/mlvis team

[cla]: https://cla-assistant.io/uber/manifold
[github]: https://github.com/uber/manifold
[git-iss]: https://github.com/uber/manifold/issues
[git-pr]: https://github.com/uber/manifold/pulls
[api-docs]: https://github.com/uber/manifold/tree/master/docs
