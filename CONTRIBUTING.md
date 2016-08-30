# Contributing to Moovie
Thank you for contributing to Moovie! All contributions are welcome and will be fully credited.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [What should I know?](#what-should-i-know)
  - [Code of Conduct](#code-of-conduct)
  - [Design and Structure](#design-and-structure)
  - [Style Guidelines](#style-guidelines)
    - [Commit Messages](#commit-messages)
    - [JavaScript](#javascript)
  - [Writing Tests](#writing-tests)
  - [Build Process](#build-process)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggestions](#suggestions)
  - [Pull Requests](#pull-requests)

## What should I know?

### Code of Conduct
This project adheres to the Contributor Covenant [Code of Conduct](CONDUCT.md). By contributing, you are expected to uphold this code. Please report unacceptable behavior to [nbish11@hotmail.com](mailto:nbish11@hotmail.com).

### Design and Structure
*This will be filled in once the design and structure has been chosen.*

### Style Guidelines

#### Commit Messages
Moovie uses the same commit message guidelines as [Angular](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit).

#### JavaScript
A JavaScript style guide has not been chosen as of yet.

### Writing Tests
Our current work flow uses [Behavior Driven Design](https://en.wikipedia.org/wiki/Behavior-driven_development#Story_versus_specification) for development. To aid us in this process, we use the following tools:
- [Karma](https://karma-runner.github.io/1.0/index.html) as the test runner.
- [Mocha](https://mochajs.org/) as the test framework.
- [Expectations](https://github.com/spmason/expectations) for handling assertions.
- [Sinon](http://sinonjs.org/) for Spies, Stubs, and Mocking.
- [isparta](https://github.com/douglasduteil/isparta) for ES6 code coverage support.
- As well as many Karma plugins...

In addition to using Behavior Driven Design, we also use these principles when writing our tests:
- The [*arrange*, *act*, and *assert*](http://defragdev.com/blog/?p=783) methodology.
- Testing the *behavior*, not the *implementation*. Some good articles are [here](https://googletesting.blogspot.com.au/2013/08/testing-on-toilet-test-behavior-not.html), [here](http://mdswanson.com/blog/2015/10/05/testing-behavior-vs-implementation.html), and [here](https://www.toptal.com/freelance/your-boss-won-t-appreciate-tdd-try-bdd).
- Writing tests that do not rely on other tests or on any global states.
- Only test one module per file, and explicitly import source and required testing tools into the file.
- Keep tests simple. `it()` functions should only have one assertion per call.
- Do not provide context in `it()` descriptions, use the `context()` function instead.
- Test descriptions should be brief, clear, and concise. E.g. `it('has a balance of zero')`.
- Only write assertions on the public API.

### Build Process
Our current build tool is [npm](http://npmjs.com/) and makes heavy use of the [scripts](https://docs.npmjs.com/misc/scripts) property. It's simple to use and easy to configure. Here are a few scripts to aid in development:

- `npm run lint` - lints all source code.
- `npm run test` - lints source code and runs Karma in CI mode.
- `npm run watch` - starts Karma in development mode (watch directory for changes).
- `npm run build` - compile, transpile, minify, and bundle, ready for production.
- To see all other scripts, see Moovie's [package](https://github.com/moovie/moovie/blob/master/package.json) file.

Releases are automatically published by  [semantic-release](https://github.com/semantic-release/semantic-release). This keeps published releases as close as possible to the SemVer specification. Here are our current release streams:

- [npm](https://www.npmjs.com/package/moovie)
- [GitHub Releases](https://github.com/moovie/moovie/releases)
- [unpkg](https://npmcdn.com/moovie) (CDN for the browser bundle)

[Bower](https://bower.io/) is intentionally not supported. Read [this article](https://medium.com/@kentcdodds/why-i-don-t-commit-generated-files-to-master-a4d76382564#.p8c8vowtq) for the rationale behind this decision.

## How Can I contribute?

### Reporting Bugs
We accept bug reports via GitHub's [Issues](https://github.com/moovie/moovie/issues) tracker.

**Prior to creating an issue:**

- Please [search](https://github.com/moovie/moovie/issues) for the issue or pull request first. Odds are, if you have found it someone else might have as well.

- Make sure to check out the [master](https://github.com/moovie/moovie) branch to see if the bug has already been fixed.

- If your issue is about documentation, please consider submitting a [Pull Request](#pull-requests) instead.

**When creating your issue:**

- Open **one** [issue](https://github.com/moovie/moovie/issues) per problem.

- Write a clear and concise summary of the problem in english. A good summary should quickly and uniquely identify the bug. It should also explain the problem not the solution. If you would like to provide the solution please submit a [Pull Request](#pull-requests) instead.

- Be brief, but don't leave out any important details. Tell us what you did, what you expected to happen, and what actually happened. Remember to include the OS Platform, package version you are using, browser name and version, and steps required to reproduce the problem.

### Suggestions
To make a suggestion, just create an [issue](https://github.com/moovie/moovie/issues) over at the GitHub repository.

### Pull Requests
Contributions are handled by GitHub's [Pull Requests](https://github.com/moovie/moovie/pull) facility.

**Prior to submitting your pull request:**
- [Search](https://github.com/moovie/moovie/pulls) for an open or closed Pull Request that relates to your submission.

- You should also [search](https://github.com/moovie/moovie/issues?utf8=%E2%9C%93&q=is%3Aissue%20label%3Asuggestion%20label%3Aquestion) for any questions or suggestions relating to your submission that may have been discussed previously.

**While writing your feature or patch:**

- Use a separate branch and submit that branch in your pull request. We do not accept pull requests from your master branch.

- [Write tests!](#writing-tests) Your feature or patch will not be accepted if it does not have tests.

- Remember to follow our [style guidelines](#style-guidelines).

- Document any changes in behaviour. Make sure the [README](https://github.com/moovie/moovie/README.md) file or any other relevant documentation is kept up-to-date.

- We try to follow [SemVer v2.0.0](http://semver.org/spec/v2.0.0.html) as much as possible. If your code randomly breaks the public API, it will not be accepted.

- One pull request per patch/feature. If you want to do more than one thing, send multiple pull requests.

- Send coherent history. Make sure each individual commit in your pull request is meaningful and follows the [commit message guidelines](#commit-messages). If you had to make multiple intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.
