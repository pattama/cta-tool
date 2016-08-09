<a name="Tool"></a>

## Tool
**Kind**: global class  
<a name="new_Tool_new"></a>

### new Tool(dependencies, configuration)
Tool constructorNon-Singleton mode: Creates a new Tool InstanceSingleton mode: Returns a Tool singleton instance if matching a registered instance in the global scopeor creates a new one and registers it in the global scope otherwise


| Param | Type | Description |
| --- | --- | --- |
| dependencies | <code>Object</code> | tool's dependencies injected by Cement according to tool's configuration |
| [dependencies.logger] | <code>Logger</code> | instance of a Logger |
| configuration | <code>Object</code> | configuration of the Tool from the Cement |
| configuration.name | <code>String</code> | name or unique id of the tool |
| [configuration.singleton] | <code>Boolean</code> | whether the instance should be a Singleton or not |
| [configuration.properties] | <code>Object</code> | tools's own properties |

