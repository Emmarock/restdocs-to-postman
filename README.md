# Spring REST Docs to Postman/Insomnia Converter
[![Npm Version](https://img.shields.io/npm/v/restdocs-to-postman.svg)](https://www.npmjs.com/package/restdocs-to-postman)

This project collects cURL commands generated by [Spring REST Docs](https://projects.spring.io/spring-restdocs/) and
converts them to a [Postman](https://www.getpostman.com/) or [Insomnia](https://insomnia.rest/) collection.

Output formats:
* [Postman Collection Format v2.1.0](https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html)
* [Insomnia export format v3](https://support.insomnia.rest/article/52-importing-and-exporting-data)

Spring REST Docs is an awesome tool to generate documentation out of tests, but no API playground is provided out of the box.
Tools like Postman or Insomnia offer lots of features to play with APIs and
this project helps to bootstrap Postman and Insomnia collections from Spring REST Docs cURL snippets.
Such a feature has been requested by several people, for example in
[Spring REST Docs issue 47](https://github.com/spring-projects/spring-restdocs/issues/47).

This project can also be used with [Spring Auto REST Docs](https://github.com/ScaCap/spring-auto-restdocs) because the
very same cURL snippets are generated.

## Installation

For usage on **command line**, install globally

```bash
npm install -g restdocs-to-postman
```

For programmatic usage, install in project
 
```bash
npm install --save restdocs-to-postman
```

## Command Line Usage

```shell
restdocs-to-postman --input generated-snippets --export-format postman --output postman-collection.json
```

From the given folder, all folders are recursively scanned for `curl-request.adoc` and `curl-request.md` files.
Host and header replacements can be used with `--replacements replacements.json`.
See [replacement-example.json](https://github.com/fbenz/restdocs-to-postman/blob/master/replacements-example.json)
for an example of a replacement file.

## Programmatic Usage

```javascript
const converter = require('restdocs-to-postman');

// Convert Spring REST Docs cURL commands to Postman/Insomnia collections
const folder = './target/generated-snippets';
const exportFormat = 'postman';
const replacements = {
  host: {
    before: 'http://localhost:8080',
    after: '{{host}}'
  },
  headers: [
    {
      name: 'Authorization',
      newValue: '{{oauth2Token}}'
     }
  ]
};
const output = converter.convert({folder, exportFormat, replacements});

// Print the result
console.log(output);
```

## Running Tests

Run all tests

```shell
npm test
```

## Contributing

- Submit a Pull Request for any enhancement you made.
- Create an issue describing your particular problem.

## License

restdocs-to-postman is Open Source software released under the
[Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0.html).
