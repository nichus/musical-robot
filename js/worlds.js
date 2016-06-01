class Worlds {
  constructor(selector,options={}) {
    this._ready	  = undefined;
    this.element  = selector;
    this.worlds	  = [];
    this._options = options;
    this._url	  = "https://api.guildwars2.com/v2/worlds?ids=all";
    if (options.local) {
      this._url   = "json/worlds.json";
    }
  }
  get ready() {
    return this._ready;
  }
  fetch() {
    var self = this;
    this._ready = new Promise(function(fulfill,reject) {
      fetch(self._url)
	.then(status)
	.then(function(request){ return request.json(); })
        .then(function(json) {
	  var appendix;
	  self.worlds = json.sort(function(a,b) {
	    if (a.name > b.name) { return  1; }
	    if (a.name < b.name) { return -1; }
	    return 0;
	  });
	  json.forEach(function(e,i,l) {
	    if (self._options.debug) { console.log(e); }
	    appendix += "<option value='"+e.id+"'>"+e.name+"</option>";
	  });
	  $(self.element).append(appendix);
	  var old_world_id = getCookie('world_id');
	  if (old_world_id != null) {
	    $(self.element).val(old_world_id);
	  }
	  $(self.element).change(function() {
	    console.log('Selected world: ' + $(self.element).val());
	  });
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
