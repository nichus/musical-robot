function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}
class Worlds {
  constructor(selector,options={}) {
    this._ready	  = undefined;
    this.element  = selector;
    this.worlds	  = [];
    this._options = options;
  }
  get ready() {
    return this._ready;
  }
  fetch() {
    var self = this;
    this._ready = new Promise(function(fulfill,reject) {
      fetch("https://api.guildwars2.com/v2/worlds?ids=all")
	.then(status)
	.then(function(request){ return request.json(); })
        .then(function(json) {
	  var appendix;
	  self.worlds = json;
	  json.forEach(function(e,i,l) {
	    if (self._options.debug) { console.log(e); }
	    appendix += "<option value='"+e.id+"'>"+e.name+"</option>";
	  });
	  $(self.element).append(appendix);
	  fulfill(self.worlds);
	})
	.catch(function(error) {
	  console.log('World list request failed', error);
	});
    });
  }
  id(tgt) {
    return this.ready.then(function(worlds) {
      return worlds.find(function(elem) { return elem.id == tgt });
    });
  }
}
