'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mockrequire = require('mock-require');
const _ = require('lodash');

const Tool = require('../../lib/index');
const DEFAULTDEPENDENCIES = {
  logger: {
    info: function() {},
    author: function() {},
  },
};
const DEFAULTCONFIG = {
  name: 'tool',
  properties: {},
};

describe('Tool - _doConstruct', function() {
  context('when logger instance exists in dependencies', function() {
    let tool;
    let mockLoggerAuthorResult;
    before(function() {
      sinon.spy(Tool.prototype, '_doConstruct');
      mockLoggerAuthorResult = {
        info: sinon.stub(),
      };
      sinon.stub(DEFAULTDEPENDENCIES.logger, 'author').withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult);
      tool = new Tool(DEFAULTDEPENDENCIES, DEFAULTCONFIG);
    });
    after(function() {
      Tool.prototype._doConstruct.restore();
      DEFAULTDEPENDENCIES.logger.author.restore();
    });
    it('should call _doConstruct method', function() {
      sinon.assert.called(Tool.prototype._doConstruct);
    });
    it('should set instance returned by dependencies.logger.author() method as a property of the Tool instance', function() {
      expect(tool).to.have.property('logger', mockLoggerAuthorResult);
    });
    it('should log a logger initialized message', function() {
      sinon.assert.calledWith(mockLoggerAuthorResult.info, `Initialized logger for tool ${tool.name}`);
    });
  });

  context('when logger instance does not exist in dependencies', function() {
    let tool;
    const dependencies = _.cloneDeep(DEFAULTDEPENDENCIES);
    delete dependencies.logger;
    let MockLoggerConstructor;
    let mockLogger;
    let mockLoggerAuthorResult;
    before(function() {
      sinon.spy(Tool.prototype, '_doConstruct');
      mockLoggerAuthorResult = {
        info: sinon.stub(),
      };
      mockLogger = {
        author: sinon.stub().withArgs(DEFAULTCONFIG.name).returns(mockLoggerAuthorResult),
      };
      MockLoggerConstructor = sinon.stub().returns(mockLogger);
      mockrequire('cta-logger', MockLoggerConstructor);
      tool = new Tool(dependencies, DEFAULTCONFIG);
    });
    after(function() {
      Tool.prototype._doConstruct.restore();
    });

    it('should call _doConstruct method', function() {
      sinon.assert.called(Tool.prototype._doConstruct);
    });
    it('should create a new Logger', function() {
      sinon.assert.called(MockLoggerConstructor);
    });
    it('should set instance returned by new logger.author() method as a property of the Tool instance', function() {
      expect(tool).to.have.property('logger', mockLoggerAuthorResult);
    });
  });
});
