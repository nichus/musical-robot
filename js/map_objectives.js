/* vim: set fdm=marker */
class Objective {
  constructor(details) {
    this.id		  = details.id;
    this.coord		  = details.coord;
    this.label_coord	  = details.label_coord;
    this.map_id	          = details.map_id;
    this.map_type	  = details.map_type;
    this.name	          = details.name;
    this.sector_id        = details.sector_id;
    this.type	          = details.type;
    this.current_status	  = undefined;
    this.previous_status  = undefined;

    var partials = this.id.split('-');
    this.map_id		  = partials[0];
    this.obj_id		  = partials[1];

    this.index_map	  = {
        1:   0,    2:   1,     3:   2,    4:   3,     5:   0,     6:   5,    7:   2,    8:   1,     9:   0,
       10:   4,	  11:   8,    12:   9,   13:   7,    14:   6,    15:   4,   16:   5,   17:  11,    18:  10,
       19:   1,   20:   0,    21:   2,   22:   3,    32:   0,    33:   1,   34:   3,   35:   2,    36:   1,
       38:   3,   39:   0,    40:   0,   50:   2,    51:   1,    52:   5,   53:   4,   62:   2,    63:   3,
       64:   4,   65:   0,    66:   1,   99:   0,   100:   2,   101:   4,  102:   3,  104:   0,   105:   1,
      106:   1,  109:   1,   110:   2,  114:   0,   115:   5,   116:   3
    };
  }
  get ri() {
    if (this.current_status == undefined) {
      return 0;
    }
    var remainder = 300 - (Date.now() - this.current_status.last_flipped);
    if (remainder >=   0) { return   0; }
    if (remainder >=  10) { return  10; }
    if (remainder >=  30) { return  30; }
    if (remainder >=  60) { return  60; }
    if (remainder >= 120) { return 120; }
    if (remainder >= 180) { return 180; }
    if (remainder >= 240) { return 240; }
    if (remainder >= 300) { return 300; }

    return remainder;
  }
  get index() {
    this.index_map[this.obj_id];
  }
  update(status = undefined) {
    if (status == undefined) { return; }
    this.previous_status = this.current_status;
    this.current_status = status;
  }
}
class ObjectiveStatus {
  constructor(status) {
    this._	            = new Map();
    this._['id']            = details.id;
    this._['claimed_at']    = details.claimed_at;
    this._['claimed_by']    = details.claimed_by;
    this._['guild']	    = details.guild;
    this._['last_flipped']  = details.last_flipped;
  }
  get id() { return this._['id']; }
  get last_flipped() { return this._['last_flipped']; }
  get guild() { return this._['guild']; }
  get claimed_at() { return this._['claimed_at']; }
  get claimed_by() { return this._['claimed_by']; }

  set guild(g) { this._['guild'] = g; }
  set pguild(p) { p.then(function(g){ this.guild = g; this._['guild'] = g; });  }
}
class MapObjectives {
  constructor() {
    var self = this;
    this.objectives = [];
    this._ready = new Promise(function(fulfill,reject) {
      fetch('https://api.guildwars2.com/v2/wvw/objectives')
	.then(status)
	.then(function(request){ return request.json(); })
	.then(function(ids) {
	  var value = ids.join(',');
	  console.log(value);
	  fetch('https://api.guildwars2.com/v2/wvw/objectives?ids='+value).then(status)
	    .then(function(request){ return request.json(); })
	    .then(function(data){
	      data.forEach(function(elem) {
		//console.log(elem);
		//var obj = new Objective(elem);
		////console.log(obj);
		//self.objectives.push(obj);
		self.objectives.push(new Objective(elem));
	      });
	      fulfill(self.objectives);
	  });
	});
    });
  }
  get ready() {
    return this._ready;
  }
  id(tgt) {
    return this.ready.then(function(obj) {
      return obj.find(function(elem) { return elem.id == tgt });
    });
  }
  map_id(id) {
    return this.ready.then(function(obj) {
      return obj.filter(function(elem) { return elem.map_id == id });
    });
  };
  type(map_id,type) {
    return this.map_id(map_id).then(function(obj) {
      return obj.filter(function(elem) { return elem.type == type });
    });
  };
}
