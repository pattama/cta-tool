/**
 * This source code is provided under the Apache 2.0 license and is provided
 * AS IS with no warranty or guarantee of fit for purpose. See the project's
 * LICENSE.md for details.
 * Copyright 2017 Thomson Reuters. All rights reserved.
 */

'use strict';

const hash = require('object-hash');

class Tool {
  /**
   * Tool constructor
   * Non-Singleton mode: Creates a new Tool Instance
   * Singleton mode: Returns a Tool singleton instance if matching a registered instance in the global scope
   * or creates a new one and registers it in the global scope otherwise
   * @param {Object} dependencies - tool's dependencies injected by Cement according to tool's configuration
   * @param {Logger} [dependencies.logger] - instance of a Logger
   * @param {Object} configuration - configuration of the Tool from the Cement
   * @param {String} configuration.name - name or unique id of the tool
   * @param {Boolean} [configuration.singleton] - whether the instance should be a Singleton or not
   * @param {Object} [configuration.properties] - tools's own properties
   */
  constructor(dependencies, configuration) {
    // Validates arguments and sets core Class properties
    if (dependencies === null || typeof dependencies !== 'object') {
      throw (new Error('missing/incorrect \'dependencies\' object argument'));
    }
    this.dependencies = dependencies;

    if (configuration === null || typeof configuration !== 'object') {
      throw (new Error('missing/incorrect \'configuration\' object argument'));
    }
    this.configuration = configuration;

    if (!configuration.hasOwnProperty('name') || typeof configuration.name !== 'string') {
      throw (new Error('missing/incorrect \'name\' string property in configuration'));
    }
    this.name = configuration.name;

    if (configuration.hasOwnProperty('singleton') && typeof configuration.singleton !== 'boolean') {
      throw (new Error('incorrect \'singleton\' boolean property in configuration'));
    }
    this.singleton = configuration.hasOwnProperty('singleton') ? configuration.singleton : false;

    if (configuration.hasOwnProperty('properties') && typeof configuration.properties !== 'object') {
      throw (new Error('incorrect \'properties\' object property in configuration'));
    }
    this.properties = configuration.properties;

    if (this.dependencies.hasOwnProperty('logger')) {
      this.logger = this.dependencies.logger.author(this.name);
    } else {
      const Logger = require('cta-logger');
      const logger = new Logger();
      this.logger = logger.author(this.name);
    }
    this.logger.info(`Initialized logger for Tool ${this.name}`);

    // Creates a Map of singletons and sets it as a property of `global` variable
    // global[Symbol] = Map<*, Tool>
    // The key of the Map entries should be defined in the constructor (see `_getIdentifier` in constructor, below)
    const GLOBALKEY = Symbol.for(this.constructor.name);
    const globalSymbols = Object.getOwnPropertySymbols(global);
    const hasSingletonsMap = (globalSymbols.indexOf(GLOBALKEY) > -1);
    if (!hasSingletonsMap) {
      global[GLOBALKEY] = new Map();
    }

    // if the instance should be a singleton
    // and if no existing singleton match the identifier, a new one (this) is created and registered
    // else a matching singleton is returned
    if (this.singleton) {
      const identifier = this._getIdentifier(configuration.properties);
      const singletonAlreadyExists = global[GLOBALKEY].has(identifier);
      if (!singletonAlreadyExists) {
        global[GLOBALKEY].set(identifier, this);
      } else {
        // retrieve the instance from the global Map
        return global[GLOBALKEY].get(identifier);
      }
    }
  }

  /**
   * Returns an identifier (String)
   * The identifier is the key used to set&get an instance of this Tool from the global Map of singletons
   * In case this Tool should be one unique Singleton, simply return a CONSTANT
   *
   * By default, this method returns an sha1 hash of the properties Object
   * @param properties - Tool's own properties
   * @returns *
   * @private
   * @abstract
   */
  _getIdentifier(properties) {
    return hash(properties);
  }
}

module.exports = Tool;
