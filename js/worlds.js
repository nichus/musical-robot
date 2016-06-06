class Worlds {
  constructor(selector,options={}) {
    this._ready	  = undefined;
    this.element  = selector;
    this._worlds  = [];
    this._options = options;
    this._url	  = "https://api.guildwars2.com/v2/worlds?ids=all";
    if (options.local) {
      this._url   = "json/worlds.json";
    }
    this._world	  = undefined;
  }
  get ready() {
    return this._ready;
  }
  get world() {
    return this._world;
  }
  get worlds() {
    return this._worlds;
  }
  fromCookie(matchStatus) {
    this._world = getCookie('worldId');
    if (this.world != null) {
      $(this.element).val(this.world);
      matchStatus.start(this);
    }
  }
  fetch(mS) {
    var self = this;
    this._ready = new Promise(function(fulfill,reject) {
      fetch(self._url)
	.then(status)
	.then(function(request){ return request.json(); })
        .then(function(json) {
	  var appendix;
	  self._worlds = json.sort(function(a,b) {
	    if (a.name > b.name) { return  1; }
	    if (a.name < b.name) { return -1; }
	    return 0;
	  });
	  json.forEach(function(e,i,l) {
	    if (self._options.debug) { console.log(e); }
	    appendix += "<option value='"+e.id+"'>"+e.name+"</option>";
	  });
	  $(self.element).append(appendix);
	  self.ready.then(function() {
	    $(self.element).change(function() {
	      self._world = $(self.element).val();
	      setCookie('worldId',self.world);
	      console.log('Selected world: ' + self.world);
	      mS.start(self);
	    });
	    self.fromCookie(mS);
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
