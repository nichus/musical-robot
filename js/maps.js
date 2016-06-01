/*
 * This object is nice, and works, but the functionality it provides is no longer needed.
 *
class Maps {
  constructor() {
    this._ready	  = new Promise(function(fulfill,reject) {
      fetch("json/maps.json")
	.then(status)
	.then(function(request) { return request.json(); })
	.then(function(json) {
	  var maps = json;
	  fulfill(maps);
	})
	.catch(function(error) {
	  console.log('Map list request failed', error);
	});
    });
  }
  get ready() {
    return this._ready;
  }
  id(tgt) {
    return this.ready.then(function(maps) {
      return maps.find(function(map) { return map.id == tgt });
    });
  }
}
*/
