/************************************************************************
# ScriptCraft API Reference

Walter Higgins

[walter.higgins@gmail.com][email]

[email]: mailto:walter.higgins@gmail.com?subject=ScriptCraft_API_Reference

## Modules in Scriptcraft

ScriptCraft has a simple module loading system. In ScriptCraft, files
and modules are in one-to-one correspondence. As an example, foo.js
loads the module circle.js in the same directory. 
*ScriptCraft now uses the same module system as Node.js - see [Node.js Modules][njsmod] for more details.*

[njsmod]: http://nodejs.org/api/modules.html

The contents of foo.js:

    var circle = require('./circle.js');
    echo( 'The area of a circle of radius 4 is '
               + circle.area(4));

The contents of circle.js:

    var PI = Math.PI;
    
    exports.area = function (r) {
      return PI * r * r;
    };

    exports.circumference = function (r) {
      return 2 * PI * r;
    };

The module circle.js has exported the functions area() and
circumference(). To add functions and objects to the root of your
module, you can add them to the special exports object.

Variables local to the module will be private, as though the module
was wrapped in a function. In this example the variable PI is private
to circle.js.

If you want the root of your module's export to be a function (such as
a constructor) or if you want to export a complete object in one
assignment instead of building it one property at a time, assign it to
module.exports instead of exports.

## Module Loading

When the ScriptCraft Java plugin is first installed, a new
subdirectory is created in the craftbukkit directory. If your
craftbukkit directory is called 'craftbukkit' then the new
subdirectories will be ...

 * craftbukkit/scriptcraft/
 * craftbukkit/scriptcraft/plugins
 * craftbukkit/scriptcraft/modules
 * craftbukkit/scriptcraft/lib

... The `plugins`, `modules` and `lib` directories each serve a different purpose.

### The plugins directory

At server startup the ScriptCraft Java plugin is loaded and begins
automatically loading and executing all of the modules (javascript
files with the extension `.js`) it finds in the `scriptcraft/plugins`
directory. All modules in the plugins directory are automatically
loaded into the `global` namespace. What this means is that anything a
module in the `plugins` directory exports becomes a global
variable. For example, if you have a module greeting.js in the plugins
directory....

    exports.greet = function() {
        echo('Hello ' + self.name);
    };

... then `greet` becomes a global function and can be used at the
in-game (or server) command prompt like so...

    /js greet()

... This differs from how modules (in NodeJS and commonJS
environments) normally work. If you want your module to be exported
globally, put it in the `plugins` directory. If you don't want your
module to be exported globally but only want it to be used by other
modules, then put it in the `modules` directory instead. If you've
used previous versions of ScriptCraft and have put your custom
javascript modules in the `js-plugins` directory, then put them in the
`scriptcraft/plugins` directory. To summarise, modules in this directory are ...

 * Automatically loaded and run at server startup.
 * Anything exported by modules becomes a global variable.

### The modules directory

The module directory is where you should place your modules if you
don't want to export globally. In javascript, it's considered best
practice not to have too many global variables, so if you want to
develop modules for others to use, or want to develop more complex
mods then your modules should be placed in the `modules` directory.
*Modules in the `modules` directory are not automatically loaded at
startup*, instead, they are loaded and used by other modules/plugins
using the standard `require()` function.  This is the key difference
between modules in the `plugins` directory and modules in the
`modules` directory. Modules in the `plugins` directory are
automatically loaded and exported in to the global namespace at server
startup, modules in the `modules` directory are not.

### The lib directory

Modules in the `lib` directory are for use by ScriptCraft and some
core functions for use by module and plugin developers are also
provided. The `lib` directory is for internal use by ScriptCraft.
Modules in this directory are not automatically loaded nor are they
globally exported.

### Directories 

As of December 24 2013, the `scriptcraft/plugins` directory has the following sub-directories...

 * drone - Contains the drone module and drone extensions. Drone was the first scriptcraft module.
 * mini-games - Contains mini-games 
 * arrows - The arrows module
 * signs - The signs module (includes example signs)
 * chat - The chat plugin/module
 * alias - The alias plugin/module
 * home - The home module - for setting homes and visiting other homes.

## Core Module: functions

ScripCraft provides some functions which can be used by all plugins/modules...

 * echo (message) - Displays a message on the screen. 
   For example: `/js echo('Hello World')` will print Hello World on the in-game chat window.  
   For programmers familiar with Javascript web programming, an `alert` function is also provided. 
   `alert` works exactly the same as `echo` e.g. `alert('Hello World')` 

 * require (modulename) - Will load modules. See [Node.js modules][njsmod]

 * load (filename,warnOnFileNotFound) - loads and evaluates a javascript file, returning the evaluated object. (Note: Prefer `require()` to `load()`)
  
 * save (object, filename) - saves an object to a file.

 * plugin (name, interface, isPersistent) - defines a new plugin. If
   isPersistent is true then the plugin doesn't have to worry about
   loading and saving state - that will be done by the framework. Just
   make sure that anything you want to save (and restore) is in the plugin's
   'store' property - this will be created automatically if not
   already defined.  (its type is object {} ) . More on plugins below.
    
 * command (name, function) - defines a command that can be used by
   non-operators. The `command` function provides a way for plugin
   developers to provide new commands for use by players.

### require() function

ScriptCraft's `require()` function is used to load modules. The `require()` function takes a 
module name as a parameter and will try to load the named module.

#### Parameters

 * modulename - The name of the module to be loaded. Can be one of the following...

   - A relative file path (with or without `.js` suffix)
   - An absolute file path (with or without `.js` suffix)
   - A relative directory path (uses node.js rules for directories)
   - An absolute directory path (uses node.js rules for directories)
   - A name of the form `'events'` - in which case the `lib` directory and `modules` directories are searched for the module.

#### Return

require() will return the loaded module's exports.

### load() function 

#### No longer recommended for use by Plugin/Module developers (deprecated)

load() should only be used to load .json data.

#### Parameters

 * filename - The name of the file to load.
 * warnOnFileNotFound (optional - default: false) - warn if the file was not found.

#### Return

load() will return the result of the last statement evaluated in the file.

#### Example

    load(__folder + "myFile.js"); // loads a javascript file and evaluates it.

    var myData = load("myData.json"); // loads a javascript file and evaluates it - eval'd contents are returned.

myData.json contents...

    __data = { 
        players: {
            walterh: {
                h: ["jsp home {1}"],
                sunny:["time set 0",
                       "weather clear"]
                     }
                 }
            }

### save() function

The save() function saves an in-memory javascript object to a
specified file. Under the hood, save() uses JSON (specifically
json2.js) to save the object. Again, there will usually be no need to
call this function directly as all javascript plugins' state are saved
automatically if they are declared using the `plugin()` function.  Any
in-memory object saved using the `save()` function can later be
restored using the `load()` function.

#### Parameters

 * objectToSave : The object you want to save.
 * filename : The name of the file you want to save it to.

#### Example

    var myObject = { name: 'John Doe',
                     aliases: ['John Ray', 'John Mee'],
                     date_of_birth: '1982/01/31' };
    save(myObject, 'johndoe.json');

johndoe.json contents...

    var __data = { "name": "John Doe", 
                   "aliases": ["John Ray", "John Mee"], 
                   "date_of_birth": "1982/01/31" };

### plugin() function

The `plugin()` function should be used to declare a javascript module
whose state you want to have managed by ScriptCraft - that is - a
Module whose state will be loaded at start up and saved at shut down.
A plugin is just a regular javascript object whose state is managed by
ScriptCraft.  The only member of the plugin which whose persistence is
managed by Scriptcraft is `store` - this special member will be
automatically saved at shutdown and loaded at startup by
ScriptCraft. This makes it easier to write plugins which need to
persist data.

#### Parameters
 
 * pluginName (String) : The name of the plugin - this becomes a global variable.
 * pluginDefinition (Object) : The various functions and members of the plugin object.
 * isPersistent (boolean - optional) : Specifies whether or not the plugin/object state should be loaded and saved by ScriptCraft.

#### Example

See chat/color.js for an example of a simple plugin - one which lets
players choose a default chat color. See also [Anatomy of a
ScriptCraft Plugin][anatomy].
 
[anatomy]: http://walterhiggins.net/blog/ScriptCraft-1-Month-later

### command() function

The `command()` function is used to expose javascript functions for
use by non-operators (regular players). Only operators should be
allowed use raw javascript using the `/js ` command because it is too
powerful for use by regular players and can be easily abused. However,
the `/jsp ` command lets you (the operator / server administrator /
plugin author) safely expose javascript functions for use by players.

#### Parameters
 
 * commandName : The name to give your command - the command will be invoked like this by players `/jsp commandName`
 * commandFunction: The javascript function which will be invoked when the command is invoked by a player.
 * options (Array - optional) : An array of command options/parameters
   which the player can supply (It's useful to supply an array so that
   Tab-Completion works for the `/jsp ` commands.
 * intercepts (boolean - optional) : Indicates whether this command
   can intercept Tab-Completion of the `/jsp ` command - advanced
   usage - see alias/alias.js for example.

#### Example

See chat/colors.js or alias/alias.js or homes/homes.js for examples of how to use the `command()` function.

### ready() function

The `ready()` function provides a way for plugins to do additional
setup once all of the other plugins/modules have loaded.  For example,
event listener registration can only be done after the
events/events.js module has loaded. A plugin author could load the
file explicilty like this...

    load(__folder + "../events/events.js");

    // event listener registration goes here 

... or better still, just do event regristration using the `ready()`
handler knowing that by the time the `ready()` callback is invoked,
all of the scriptcraft modules have been loaded...

    ready(function(){
        // event listener registration goes here
        // code that depends on other plugins/modules also goes here
    });

The execution of the function object passed to the `ready()` function
is *deferred* until all of the plugins/modules have loaded. That way
you are guaranteed that when the function is invoked, all of the
plugins/modules have been loaded and evaluated and are ready to use.

***/

var global = this;


/*************************************************************************
Core Module - Special Variables
===============================
There are a couple of special javascript variables available in ScriptCraft...
 
 * __folder - The current working directory - this variable is only to be used within the main body of a .js file.
 * __plugin - The ScriptCraft JavaPlugin object.
 * server - The Minecraft Server object.
 * self - the current player. (Note - this value should not be used in multi-threaded scripts - it's not thread-safe)

***/
/*
  wph 20130124 - make self, plugin and server public - these are far more useful now that tab-complete works.
*/
var server = org.bukkit.Bukkit.server;
//
// private implementation
//
(function(){
    //
    // don't execute this more than once
    //
    if (typeof load == "function")
        return ;
    var File = java.io.File;

    var _canonize = function(file){ 
        return "" + file.getCanonicalPath().replaceAll("\\\\","/"); 
    };
    
    var _originalScript = __script;
    var parentFileObj = new File(__script).getParentFile();
    var jsPluginsRootDir = parentFileObj.getParentFile();
    var jsPluginsRootDirName = _canonize(jsPluginsRootDir);



    var _loaded = {};
    /*
      Load the contents of the file and evaluate as javascript
     */
    var _load = function(filename,warnOnFileNotFound)
    {
        var FileReader = java.io.FileReader
        ,BufferedReader = java.io.BufferedReader
        ,result = null
        ,file = filename
        ,r = undefined;
        
        if (!(filename instanceof File))
            file = new File(filename);

        var canonizedFilename = _canonize(file);
        //
        // wph 20130123 don't load the same file more than once.
        //
        if (_loaded[canonizedFilename])
            return _loaded[canonizedFilename];
        
        if (file.exists()) {
            var parent = file.getParentFile();
            var reader = new FileReader(file);
            var br = new BufferedReader(reader);
            __engine.put("__script",canonizedFilename);
            __engine.put("__folder",(parent?_canonize(parent):"")+"/");
            
            var code = "";
            try{
                if (file.getCanonicalPath().endsWith(".coffee")) {
                    while ((r = br.readLine()) !== null) code += "\"" + r + "\" +\n";
                    code += "\"\"";
                    var code = "load(__folder + \"../core/_coffeescript.js\"); var ___code = "+code+"; eval(CoffeeScript.compile(___code, {bare: true}))";
                } else {
                    while ((r = br.readLine()) !== null) 
                        code += r + "\n";
                }
                result = __engine.eval("(" + code + ")");
                _loaded[canonizedFilename] = result || true;
            }catch (e){
                __plugin.logger.severe("Error evaluating " + canonizedFilename + ", " + e );
            }
            finally {
                try {
                    reader.close();
                }catch (re){
                    // fail silently on reader close error
                }
            }
        }else{
            if (warnOnFileNotFound) 
                __plugin.logger.warning(canonizedFilename + " not found");
        }
        return result;
    };
    /*
      now that load is defined, use it to load a global config object
     */
    var config = _load(new File(jsPluginsRootDir, "data/global-config.json" ));
    if (!config)
        config = {verbose: false};
    global.config = config;
    /*
      Tab Completion of the /js and /jsp commands
    */
    var _isJavaObject = function(o){
        var result = false;
        try {
            o.hasOwnProperty("testForJava");
        }catch (e){
            // java will throw an error when an attempt is made to access the
            // hasOwnProperty method. (it won't exist for Java objects)
            result = true;
        }
        return result;
    };
    var _javaLangObjectMethods = ["equals","getClass","class","getClass","hashCode","notify","notifyAll","toString","wait","clone","finalize"];
    
    var _getProperties = function(o)
    {
        var result = [];
        if (_isJavaObject(o))
        {
            propertyLoop:
            for (var i in o)
            {
                //
                // don't include standard Object methods
                //
                var isObjectMethod = false;
                for (var j = 0;j < _javaLangObjectMethods.length; j++)
                    if (_javaLangObjectMethods[j] == i)
                        continue propertyLoop;
                var typeofProperty = null;
                try { 
                    typeofProperty = typeof o[i];
                }catch( e ){
                    if (e.message == "java.lang.IllegalStateException: Entity not leashed"){
                        // wph 20131020 fail silently for Entity leashing in craftbukkit
                    }else{
                        throw e;
                    }
                }
                if (typeofProperty == "function" )
                    result.push(i+"()");
                else
                    result.push(i);
            }
        }else{
            if (o.constructor == Array)
                return result;

            for (var i in o){
                if (i.match(/^[^_]/)){
                    if (typeof o[i] == "function")
                        result.push(i+"()");
                    else
                        result.push(i);
                }
            }
        }
        return result.sort();
    };
    /*
      Tab completion for the /jsp commmand
    */
    var __onTabCompleteJSP = function() {
        var result = global.__onTC_result;
        var args = global.__onTC_args;
        var cmdInput = args[0];
        var cmd = _commands[cmdInput];
        if (cmd){
            var opts = cmd.options;
            var len = opts.length;
            if (args.length == 1){
                for (var i = 0;i < len; i++)
                    result.add(opts[i]);
            }else{
                // partial e.g. /jsp chat_color dar
                for (var i = 0;i < len; i++){
                    if (opts[i].indexOf(args[1]) == 0){
                        result.add(opts[i]);
                    }
                }
            }
        }else{
            if (args.length == 0){
                for (var i in _commands)
                    result.add(i);
            }else{
                // partial e.g. /jsp al 
                // should tabcomplete to alias 
                //
                for (var c in _commands){
                    if (c.indexOf(cmdInput) == 0){
                        result.add(c);
                    }
                }
            }
        }
        return result;
    };
    var _commands;
    /*
      Tab completion for the /js command
    */
    var __onTabCompleteJS = function()
    {
        if (__onTC_cmd.name == "jsp")
            return __onTabCompleteJSP()

        var _globalSymbols = _getProperties(global)
        var result = global.__onTC_result;
        var args = global.__onTC_args;
        var lastArg = args.length?args[args.length-1]+"":null;
        var propsOfLastArg = [];
        var statement = args.join(" ");

        statement = statement.replace(/^\s+/,"").replace(/\s+$/,"");

        
        if (statement.length == 0)
            propsOfLastArg = _globalSymbols;
        else{
            var statementSyms = statement.split(/[^\$a-zA-Z0-9_\.]/);
            var lastSymbol = statementSyms[statementSyms.length-1];
            //print("DEBUG: lastSymbol=[" + lastSymbol + "]");
            //
            // try to complete the object ala java IDEs.
            //
            var parts = lastSymbol.split(/\./);
            var name = parts[0];
            var symbol = global[name];
            var lastGoodSymbol = symbol;
            if (typeof symbol != "undefined")
            {
                for (var i = 1; i < parts.length;i++){
                    name = parts[i];
                    symbol = symbol[name];
                    if (typeof symbol == "undefined")
                        break;
                    lastGoodSymbol = symbol;
                }
                //print("debug:name["+name+"]lastSymbol["+lastSymbol+"]symbol["+symbol+"]");
                if (typeof symbol == "undefined"){
                    //
                    // look up partial matches against last good symbol
                    //
                    var objectProps = _getProperties(lastGoodSymbol);
                    if (name == ""){
                        // if the last symbol looks like this.. 
                        // ScriptCraft.
                        //

                        for (var i =0;i < objectProps.length;i++){
                            var candidate = lastSymbol + objectProps[i];
                            var re = new RegExp(lastSymbol + "$","g");
                            propsOfLastArg.push(lastArg.replace(re,candidate));
                        }
                        
                    }else{
                        // it looks like this..
                        // ScriptCraft.co
                        //
                        //print("debug:case Y: ScriptCraft.co");

                        var li = statement.lastIndexOf(name);
                        for (var i = 0; i < objectProps.length;i++){
                            if (objectProps[i].indexOf(name) == 0)
                            {
                                var candidate = lastSymbol.substring(0,lastSymbol.lastIndexOf(name));
                                candidate = candidate + objectProps[i];
                                var re = new RegExp(lastSymbol+ "$","g");
                                //print("DEBUG: re=" + re + ",lastSymbol="+lastSymbol+",lastArg=" + lastArg + ",candidate=" + candidate);
                                propsOfLastArg.push(lastArg.replace(re,candidate));
                            }
                        }
                        
                    }
                }else{
                    //print("debug:case Z:ScriptCraft");
                    var objectProps = _getProperties(symbol);
                    for (var i = 0; i < objectProps.length; i++){
                        var re = new RegExp(lastSymbol+ "$","g");
                        propsOfLastArg.push(lastArg.replace(re,lastSymbol + "." + objectProps[i]));
                    }
                }
            }else{
                //print("debug:case AB:ScriptCr");
                // loop thru globalSymbols looking for a good match
                for (var i = 0;i < _globalSymbols.length; i++){
                    if (_globalSymbols[i].indexOf(lastSymbol) == 0){
                        var possibleCompletion = _globalSymbols[i];
                        var re = new RegExp(lastSymbol+ "$","g");
                        propsOfLastArg.push(lastArg.replace(re,possibleCompletion));
                    }
                }
                
            }
        }
        for (var i = 0;i < propsOfLastArg.length; i++)
            result.add(propsOfLastArg[i]);
    };

    /*
      Unload Handlers
    */
    var unloadHandlers = [];
    var _addUnloadHandler = function(f) {
        unloadHandlers.push(f);
    };
    var _runUnloadHandlers = function() {
        for (var i = 0; i < unloadHandlers.length; i++) {
            unloadHandlers[i]();
        }
    };

/*************************************************************************
## Miscellaneous Core Functions

### setTimeout() function

This function mimics the setTimeout() function used in browser-based javascript.
However, the function will only accept a function reference, not a string of javascript code.
Where setTimeout() in the browser returns a numeric value which can be subsequently passed to 
clearTimeout(), This implementation returns a [BukkitTask][btdoc] object which can be subsequently passed to ScriptCraft's own clearTimeout() implementation.

If Node.js supports setTimeout() then it's probably good for ScriptCraft to support it too.

[btdoc]: http://jd.bukkit.org/beta/apidocs/org/bukkit/scheduler/BukkitTask.html

#### Example

    //
    // start a storm in 5 seconds
    //    
    setTimeout( function() {
        var world = server.worlds.get(0);
        world.setStorm(true);
    }, 5000);

***/
    global.setTimeout = function( callback, delayInMillis){
        //
        // javascript programmers familiar with setTimeout know that it expects
        // a delay in milliseconds. However, bukkit's scheduler expects a delay in ticks 
        // (where 1 tick = 1/20th second)
        //
        var bukkitTask = server.scheduler.runTaskLater(__plugin, callback, delayInMillis/50);
        return bukkitTask;
    };
    
/*************************************************************************
### clearTimeout() function

A scriptcraft implementation of clearTimeout().

***/
    global.clearTimeout = function(bukkitTask){
        bukkitTask.cancel();
    };

/*************************************************************************
### setInterval() function

This function mimics the setInterval() function used in browser-based javascript.
However, the function will only accept a function reference, not a string of javascript code.
Where setInterval() in the browser returns a numeric value which can be subsequently passed to 
clearInterval(), This implementation returns a [BukkitTask][btdoc] object which can be subsequently passed to ScriptCraft's own clearInterval() implementation.

If Node.js supports setInterval() then it's probably good for ScriptCraft to support it too.

[btdoc]: http://jd.bukkit.org/beta/apidocs/org/bukkit/scheduler/BukkitTask.html

***/
    global.setInterval = function(callback, intervalInMillis){
        var delay = intervalInMillis/ 50;
        var bukkitTask = server.scheduler.runTaskTimer(__plugin, callback, delay, delay);
        return bukkitTask;
    };
/*************************************************************************
### clearInterval() function

A scriptcraft implementation of clearInterval().

***/
    global.clearInterval = function(bukkitTask){
        bukkitTask.cancel();
    };

/*************************************************************************
### refresh() function

The refresh() function will ...

1. Disable the ScriptCraft plugin.
2. Unload all event listeners associated with the ScriptCraft plugin.
3. Enable the ScriptCraft plugin.

... refresh() can be used during development to reload only scriptcraft javascript files.
See [issue #69][issue69] for more information.

[issue69]: https://github.com/walterhiggins/ScriptCraft/issues/69

***/
    global.refresh = function(){
        __plugin.pluginLoader.disablePlugin(__plugin);
        __plugin.pluginLoader.enablePlugin(__plugin);
    };

    var _echo = function (msg) {
        __plugin.logger.info( msg );
        if (typeof self == "undefined"){
            return;
        }
        self.sendMessage(msg);
    };

    global.echo = _echo;
    global.alert = _echo;
    global.load = _load;
    global.logger = __plugin.logger;
    global._onTabComplete = __onTabCompleteJS;
    global.addUnloadHandler = _addUnloadHandler;

    var fnRequire = load(jsPluginsRootDirName + '/lib/require.js',true);
    /*
      setup paths to search for modules
     */
    var modulePaths = [jsPluginsRootDirName + '/lib/',
                       jsPluginsRootDirName + '/modules/'];
    global.require = fnRequire(__plugin.logger, 
                               __engine, 
                               config.verbose, 
                               jsPluginsRootDirName,
                               modulePaths);


    var plugins = require('plugin');
    _commands = plugins.commands;
    global.plugin = plugins.plugin;
    global.command = plugins.command;
    global.save = plugins.save;

    var events = require('events');
    events.on('server.PluginDisableEvent',function(l,e){
        // save config
        plugins.save(global.config, new File(jsPluginsRootDir, "data/global-config.json" ));

        _runUnloadHandlers();
        org.bukkit.event.HandlerList["unregisterAll(org.bukkit.plugin.Plugin)"](__plugin);
    });
    // wph 20131226 - make events global as it is used by many plugins/modules
    global.events = events;

    plugins.autoload(jsPluginsRootDir);


}());



