'use strict';
const hash = require('object-hash');

class Tool {
  /**
   * Tool constructor
   * Non-Singleton mode: Creates a new Tool Instance
   * Singleton mode: Returns a Tool singleton instance if matching a registered instance in the global scope
   * or creates a new one and registers it in the global scope otherwise
   * @param {Object} dependencies - tool's dependencies injected by Cement according to tool's configuration
   * @param {Object} configuration - configuration of the Tool from the Cement
   * @param {String} configuration.name - name or unique id of the tool
   * @param {Boolean} [configuration.singleton] - whether the instance should be a Singleton or not
   * @param {Object} [configuration.properties] - tools's own properties
   */
  constructor(dependencies, configuration) {
    // Validates arguments and sets core Class properties
    if (dependencies === null || typeof dependencies !== 'object') {
      throw (new Error(`missing/incorrect 'dependencies' object argument`));
    }
    this.dependencies = dependencies;

    if (configuration === null || typeof configuration !== 'object') {
      throw (new Error(`missing/incorrect 'configuration' object argument`));
    }
    this.configuration = configuration;

    if (!configuration.hasOwnProperty('name') || typeof configuration.name !== 'string') {
      throw (new Error(`missing/incorrect 'name' string property in configuration`));
    }
    this.name = configuration.name;

    if (configuration.hasOwnProperty('singleton') && typeof configuration.singleton !== 'boolean') {
      throw (new Error(`incorrect 'singleton' boolean property in configuration`));
    }
    this.singleton = configuration.hasOwnProperty('singleton') ? configuration.singleton : false;

    if (configuration.hasOwnProperty('properties') && typeof configuration.properties !== 'object') {
      throw (new Error(`incorrect 'properties' object property in configuration`));
    }
    this.properties = configuration.properties;

    // Creates a Map of singletons and sets it as a property of `global` variable
    // global[Symbol] = Map<*, Tool>
    // The key of the Map entries should be defined in the constructor (see `_getIdentifier` in constructor, below)
    const GLOBALKEY = Symbol.for(this.constructor.name);
    const globalSymbols = Object.getOwnPropertySymbols(global);
    const hasSingletonsMap = (globalSymbols.indexOf(GLOBALKEY) > -1);
    if (!hasSingletonsMap) {
      global[GLOBALKEY] = new Map();
    }

    // if the instance should not be a singleton, a new instance is created
    // else if no existing instance match the identifier, a new one is created
    // else the matching instance is returned
    if (!this.singleton) {
      this._doConstruct(dependencies, configuration);
    } else {
      const identifier = this._getIdentifier(configuration.properties);

      const singletonAlreadyExists = global[GLOBALKEY].has(identifier);
      if (!singletonAlreadyExists) {
        this._doConstruct(dependencies, configuration);
        global[GLOBALKEY].set(identifier, this);
      } else {
        // retrieve the instance from the global Map
        return global[GLOBALKEY].get(identifier);
      }
    }
  }

  /**
   * Defines the additional properties of the instance
   * @param {Object} dependencies - tool's dependencies injected by Cement according to tool's configuration
   * @param {Object} configuration - configuration of the Tool from the Cement
   * @param {Object} [configuration.properties] - tools's own parameters
   * @private
   * @abstract
   */
  _doConstruct(dependencies, configuration) { // eslint-disable-line no-unused-vars
    if (this.dependencies.logger) {
      this.logger = this.dependencies.logger.author(this.name);
    } else {
      const Logger = require('cta-logger');
      const logger = new Logger();
      this.logger = logger.author(this.name);
    }
    this.logger.info(`Initialized logger for tool ${this.name}`);
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
