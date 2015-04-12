angular.module("entangled",[]).factory("Entangled",function(){return function(){function e(e,t,r){for(var o in e)e.hasOwnProperty(o)&&(this[o]=e[o]);this.webSocketUrl=t,r&&(this[r]=function(){return new s(this.webSocketUrl+"/"+this.id+"/"+r)})}function t(t,s,r){this.all=[];for(var o=0;o<t.length;o++){var i=new e(t[o],s,r);this.all.push(i)}}function s(e){this.webSocketUrl=e}return e.prototype.$save=function(e){if(this.id){var t=new WebSocket(this.webSocketUrl+"/"+this.id+"/update");t.onopen=function(){t.send(JSON.stringify(this))}.bind(this),t.onmessage=function(t){if(t.data){var r=JSON.parse(t.data);if(r.resource)for(key in r.resource)this[key]=r.resource[key]}this[this.hasMany]=new s(this.webSocketUrl+"/"+this.id+"/"+this.hasMany),e&&e(this)}.bind(this)}else{var t=new WebSocket(this.webSocketUrl+"/create");t.onopen=function(){t.send(JSON.stringify(this))}.bind(this),t.onmessage=function(t){if(t.data){var s=JSON.parse(t.data);if(s.resource)for(key in s.resource)this[key]=s.resource[key]}e&&e(this)}.bind(this)}},e.prototype.$update=function(e,t){for(var s in e)e.hasOwnProperty(s)&&(this[s]=e[s]);this.$save(t)},e.prototype.$destroy=function(e){var t=new WebSocket(this.webSocketUrl+"/"+this.id+"/destroy");t.onopen=function(){t.send(null)},t.onmessage=function(t){if(t.data){var s=JSON.parse(t.data);if(s.resource)for(key in s.resource)this[key]=s.resource[key];this.destroyed=!0,Object.freeze(this)}e&&e(this)}.bind(this)},e.prototype.$valid=function(){return!(this.errors&&Object.keys(this.errors).length)},e.prototype.$invalid=function(){return!this.$valid()},e.prototype.$persisted=function(){return!(this.$newRecord()||this.$destroyed())},e.prototype.$newRecord=function(){return!this.id},e.prototype.$destroyed=function(){return!!this.destroyed},s.prototype.hasMany=function(e){this.hasMany=e},s.prototype["new"]=function(t){return new e(t,this.webSocketUrl,this.hasMany)},s.prototype.all=function(s){var r=new WebSocket(this.webSocketUrl);r.onmessage=function(o){if(o.data.length){var i=JSON.parse(o.data);if(i.resources)this.resources=new t(i.resources,r.url,this.hasMany);else if(i.action)if("create"===i.action)this.resources.all.push(new e(i.resource,r.url,this.hasMany));else if("update"===i.action){for(var n,a=0;a<this.resources.all.length;a++)this.resources.all[a].id===i.resource.id&&(n=a);this.resources.all[n]=new e(i.resource,r.url,this.hasMany)}else if("destroy"===i.action){for(var n,a=0;a<this.resources.all.length;a++)this.resources.all[a].id===i.resource.id&&(n=a);this.resources.all.splice(n,1)}else console.log("Something else other than CRUD happened..."),console.log(i)}s(this.resources.all)}.bind(this)},s.prototype.create=function(e,t){var s=this["new"](e);s.$save(t)},s.prototype.find=function(t,s){var r=this.webSocketUrl,o=new WebSocket(r+"/"+t);o.onmessage=function(t){if(t.data.length){var o=JSON.parse(t.data);o.resource&&!o.action?this.resource=new e(o.resource,r,this.hasMany):o.action?"update"===o.action?this.resource=new e(o.resource,r,this.hasMany):"destroy"===o.action&&(this.resource=void 0):(console.log("Something else other than CRUD happened..."),console.log(o))}s(this.resource)}.bind(this)},s}()});
