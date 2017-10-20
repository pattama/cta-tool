# cta-tool [ ![build status](https://git.sami.int.thomsonreuters.com/compass/cta-tool/badges/master/build.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-tool/commits/master) [![coverage report](https://git.sami.int.thomsonreuters.com/compass/cta-tool/badges/master/coverage.svg)](https://git.sami.int.thomsonreuters.com/compass/cta-tool/commits/master)

Tool Modules for Compass Test Automation, One of Libraries in CTA-OSS Framework

## General Overview

### Overview

This module provides the **Tool** class to extend.

## Guidelines

We aim to give you brief guidelines here.

1. [Tool Class Usage](#1-tool-class-usage)
1. [Tool Class Structure](#2-tool-class-structure)
1. [Tool Class Constructor](#3-tool-class-constructor)
1. [Tool Configuration](#4-tool-configuration)

### 1. Tool Class Usage

To create **a tool** for **CTA-OSS Framework**, we need to extend the class.

```javascript
const Tool = require("cta-tool");

class SampleTool extends Tool {
  method1() {
    ...
  }

  method2() {
    ...
  }
}

module.exports = SampleTool;
```

This example shows how to use **Tool**. We can implement any methods, which in this example are **_method1()_** and **_method2()_**, that are provided within this tool.

[back to top](#guidelines)

### 2. Tool Class Structure

Here is a structure of **Tool** Class.

```javascript
class Tool {
  constructor(dependencies, configuration);
}
```

Presently, **Tool** class provides a constructor, not other methods because we aim to provide extensibility on tool.

[back to top](#guidelines)

### 3. Tool Class Constructor

In a constructor, the **Tool** uses _dependencies injection_ to make the dependencies and configuration available within **Tool**.

```javascript
class SampleTool extends Tool {
  constructor(dependencies, configuration) {
    super();  // to bind the dependencies andconfiguration
  }
}

module.exports = SampleTool;
```

By calling **super()**, the _dependencies_ and _configuration_ are bound and available within class context. They can be accesed in any method via **_this.dependencies_** and **_this.configuration_**.

[back to top](#guidelines)

### 4. Tool Configuration

```javascript
const configuration = {
  name: string;
  singleton: boolean;
  properties: any;
};

class SampleTool extends Tool {
  otherMethod() {
    const name = this.name;
    const singleton = this.singleton;
    const properties = this.properties;
    const configuration = this.configuration;
  }
}
```

The Tool Configuration has three required fields.

- name - define the tool name
- singleton - indicate whether the tool is singleton
- properties - provides properties

These values are avaliable within Tool class.

[back to top](#guidelines)

------

## To Do

* More Points