class MapObjectives {
  constructor() {
    var self = this;
    this.indexes = { 
        1:   0,    2:   1,     3:   2,    4:   3,     5:   0,     6:   5,    7:   2,    8:   1,     9:   0,
       10:   4,	  11:   8,    12:   9,   13:   7,    14:   6,    15:   4,   16:   5,   17:  11,    18:  10,
       19:   1,   20:   0,    21:   2,   22:   3,    32:   0,    33:   1,   34:   3,   35:   2,    36:   1,
       38:   3,   39:   0,    40:   0,   50:   2,    51:   1,    52:   5,   53:   4,   62:   2,    63:   3,
       64:   4,   65:   0,    66:   1,   99:   0,   100:   2,   101:   4,  102:   3,  104:   0,   105:   1,
      106:   1,  109:   1,   110:   2,  114:   0,   115:   5,   116:   3
    };
    this.objectives = [];
    this.ready = new Promise(function(fulfill,reject) {
      fetch('https://api.guildwars2.com/v2/wvw/objectives')
	.then(status)
	.then(function(request){ return request.json(); })
	.then(function(ids) {
	  var value = ids.join(',');
	  fetch('https://api.guildwars2.com/v2/wvw/objectives?ids='+value).then(status)
	    .then(function(request){ return request.json(); })
	    .then(function(data){
	      self.objectives = data;

	      self.objectives.forEach(function(elem) {
		var id = elem.id.split('-');
		elem.index = self.indexes[id[1]];
	      });
	      fulfill(self.objectives);
	  });
	});
    });
  }
  id(tgt) {
    return this.ready.then(function(objectives) {
      return objectives.find(function(elem) { return elem.id == tgt });
    });
  }
  map_id(id) {
    return this.ready.then(function(objectives) {
      return objectives.filter(function(elem) { return elem.map_id == id });
    });
  };
  type(map_id,type) {
    return this.map_id(map_id).then(function(objectives) {
      return objectives.filter(function(elem) { return elem.type == type });
    });
  };
}
