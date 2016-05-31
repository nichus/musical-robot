class WvWMap {
  constructor(which) {
    this.name	    = which;
    this.objectives = null;
    this.status	    = null;
    this.info	    = null;
    this.graph	    = which.replace("Center","CenterHome");
    this.canvas	    = new MyCanvas(this.graph,false);
    this.logger	    = new WvWLogger(this.graph.replace('Home','Log'),this.canvas.colors);
    this.infoURL    = 'https://api.guildwars2.com/v2/maps/';
  }
  updateStatus(newStatus,newMap=false,info) {
    if (newMap) {
      // console.log(this.name+ " new Map detected");
      this.logger.reset();
      this.objectives = new Map([['Camp', []],['Tower', []],['Keep', []],['Castle', []],['Ruins', []]]);
      //console.log(newStatus);
      newStatus['objectives'].forEach(function(e,i,l) {
	if (e.type === "Camp") {
	    this.objectives.get('Camp').push(
	      new Camp(this.canvas,newStatus['features']['Camp'].length,e)
	    );
	} else if (e.type === "Tower") {
	    this.objectives.get('Tower').push(
	      new Tower(this.canvas,newStatus['features']['Tower'].length,e)
	    );
	} else if (e.type === "Keep" && ! (e.id.endsWith('-113') || e.id.endsWith('-37'))) {
	    this.objectives.get('Keep').push(
	      new Keep(this.canvas,newStatus['features']['Keep'].length,e)
	    );
	} else if (e.type === "Castle" || (e.type === "Keep" && (e.id.endsWith('-113') || e.id.endsWith('-37')))) {
	    this.objectives.get('Castle').push(
	      new Castle(this.canvas,newStatus['features']['Castle'].length,e)
	    );
	} else if (e.type === "Ruins") {
	    this.objectives.get('Ruins').push(
	      new Ruins(this.canvas,newStatus['features']['Ruins'].length,e)
	    );
	}
      },this);
    }
    this.status = newStatus;
    this.draw();
  }
  draw() {
    this.canvas.drawBackground(this.name);
    ['Camp','Tower','Keep','Ruins','Castle'].forEach(function(type) {
      this.objectives.get(type).forEach(function(objective) {
	var tgt = this.status.objectives.find(function(obj) { return obj.id == objective.id() });
	objective.update(tgt,this.logger);
      },this);
    },this);
  }
}
class WorldStatus {
  constructor(statusDiv) {
    this.statdiv	  = $("#"+statusDiv);
    this.world_id	  = null;
    this.match_id	  = null;
    this.status		  = null;
    this.interval_id	  = null;
    this.last_update	  = 0;
    this.scores		  = new Map([['red',0],['blue',0],['green',0]]);
    this.maps		  = new Map();
    this.team		  = null;
    this.start_time	  = Date.now();
    this.end_time	  = 0;
    this.mapInfo	  = null;
    this.mapObjectives	  = new MapObjectives();

    ['Center','RedHome','BlueHome','GreenHome'].forEach(function(m,i,l) {
      this.maps[m] = new WvWMap(m);
    },this);
  }

  get endTime() {
    return this.end_time;
  }
  get finished() {
    return Date.now() > this.endTime;
  }
  get worldId() {
    if (this.running) {
      return this.world_id;
    }
    return null;
  }
  get running() {
    return this.last_update == 0 || ((this.match_id != null) && !this.finished);
  }
  get lastUpdate() {
    return this.last_update;
  }
  get status_url() {
    if (this.world_id != null) {
      return "https://api.guildwars2.com/v2/wvw/matches?world=" + this.world_id;
    }
    return null;
  }
  set worlds(info) {
    if (info) {
      this.team = info;
    }
  }
  get worlds() {
    return this.team;
  }

  interval(id) {
    this.interval_id = id;
  }
  worldId(id) {
    this.world_id = id;
  }
  matchCompleted() {
    this.statdiv.html("Match completed, status updates halted.  Reload to monitor current match");
    clearInterval(this.interval_id);
    this.interval_id = null;
  }
  lookupGuilds(newStatus) {
    newStatus.maps.forEach(function(element,i,l) {
      element.objectives.forEach(function(objective,j,m) {
	if (objective.claimed_by != null) {
	}
      },this);
    },this);
  }
  updateWorld(newStatus) {
    //this.lookupGuilds(newStatus);
    console.log(newStatus);
    var now = new Date();
    var newMap = false;
    this.statdiv.html("Last updated: " + moment(now).format('YYYY/MM/DD HH:mm:ss Z'));
    if (newStatus.start_time >= this.end_time) {
      this.match_id = newStatus.id;
      newMap = true;

      ["red","green","blue"].forEach(function(color) {
	displayTeam(color,newStatus.teams.get(color),newStatus.scores.get(color),newStatus.kills.get(color),newStatus.deaths.get(color));
      });
    }
    this.end_time = newStatus.end_time;
    this.status	  = newStatus;
    newStatus.maps.forEach(function(map,index,rawMaps) {
      this.maps[map.type].updateStatus(map,newMap);
    },this);
    this.scores = status.scores;
    this.last_update = now;
  }
}

var ws	    = new WorldStatus('MatchStatus');
var guilds  = new WvWGuilds();

function displayTeam(color,team,score,kills,deaths) {
  var content = "<div class='captain'>"+team[0].name+"</div>";
  content += "<div class='members'> w/ "+team.slice(1).map(function(e){ return e.name; }).join(' &amp; ')+"</div>";
  content += "<div class='stats'>";
  content += "<div class='score'> s: "+score.toLocaleString()+" </div>";
  content += "<div class='kills'> k: "+kills.toLocaleString()+" </div>";
  content += "<div class='deaths'> d: "+deaths.toLocaleString()+" </div>";
  $("#"+color+".team").html(content);
}
function sanitizeObjective(objective,o) {
  ['id','owner','type','claimed_at','claimed_by','last_flipped'].forEach(function(key) {
    switch (key) {
      case 'id':
	var parts = objective[key].split('-');
	objective['map_id'] = parts[0];
	objective['obj_id'] = parts[1];
	break;
      case 'claimed_at':
      case 'last_flipped':
	objective[key] = Date.parse(objective[key]);
	break;
      case 'claimed_by':
	if (objective[key] != null) {
	  guilds.find(objective[key],function(g) { objective['guild'] = g; });
	}
	break;
      case 'type':
      case 'owner':
	break;
    }
  });

  details = o.id(objective['id']);
  ['coord','index','label_coord','name','sector_id'].forEach(function(key) {
    switch (key) {
      case 'coord':
      case 'index':
      case 'label_coord':
      case 'name':
      case 'sector_id':
	objective[key] = details[key];
	break;
    }
  });
  return objective;
}
function sanitizeMap(map,o) {
  var newMap  = new Map();
  var teams   = ['red','green','blue'];
  ['id','bonuses','deaths','kills','objectives','scores','type'].forEach(function(key) {
    switch(key) {
      case 'id':
      case 'type':
      case 'bonuses':
	newMap[key] = map[key];
	break;
      case 'deaths':
      case 'kills':
      case 'scores':
	newMap[key] = new Map();
	teams.forEach(function(color) { newMap[key][color] = map[key][color]; });
	break;
      case 'objectives':
	newMap[key] = new Array();
	map[key].forEach(function(objective) { newMap[key].push(sanitizeObjective(objective,o)) });
	break;
    }
  });
  newMap['features'] = new Map();
  newMap['features']['Ruins']	= o.type(newMap['id'],'Ruins');
  newMap['features']['Camp']	= o.type(newMap['id'],'Camp');
  newMap['features']['Tower']	= o.type(newMap['id'],'Tower');
  newMap['features']['Keep']	= o.type(newMap['id'],'Keep');
  newMap['features']['Castle']  = o.type(newMap['id'],'Castle');
  return newMap;
}
function mapWorld(id) {
  return ws.worlds.find(function(elem) { return elem.id === id })
}
function sanitizeTeam(color, primaryId, all_worlds) {
  var team	  = new Array();

  team.push(mapWorld(primaryId));
  var otherIds  = all_worlds.filter(function(elem) { return elem != primaryId; });
  otherIds.forEach(function(elem) { team.push(mapWorld(elem)); });

  return team;
}
function sanitizeData(data,mapObjectives) {
  var sanitized	  = {};
  var teams	  = ['red','green','blue'];
  ['id','start_time','end_time','scores','worlds','all_worlds','kills','deaths','maps'].forEach(function(key) {
    switch (key) {
      case 'id':
	sanitized[key] = data[key];
	break
      case 'start_time':
      case 'end_time':
	sanitized[key] = Date.parse(data[key]);
	break;
      case 'all_worlds':
      case 'worlds':
//	sanitized[key] = new Map();
//	teams.forEach(function(color) {
//	  sanitized[key].set(color, data[key][color].map(function(elem) {
//	    return mapWorld(elem);
//	  }))
//	});
//	break;
//	sanitized[key] = new Map();
//	teams.forEach(function(color) { sanitized[key].set(color, mapWorld(data[key][color])); });
	break;
      case 'scores':
      case 'kills':
      case 'deaths':
	sanitized[key] = new Map();
	teams.forEach(function(color) { sanitized[key].set(color, data[key][color]); });
//	var current = new Map();
//	teams.forEach(function(color) { current.set(color, data[key][color]); });
//	headers.set(key,current);
	break;
      case 'maps':
	sanitized[key] = new Array();
	data[key].forEach(function(map,i) {
	  sanitized[key][i] = sanitizeMap(map,mapObjectives);
	});
//	var current = new Array();
//	data[key].forEach(function(map,i) { current.push(sanitizeMap(map)); });
//	sanitized.set(key,current);
	break;
      default:
	console.log('Unexpected match key: \''+key+'\'');
    }
  });
  var worlds = new Map();
  teams.forEach(function(color) {
    worlds.set(color,sanitizeTeam(color,data['worlds'][color],data['all_worlds'][color]));
  });
  //console.log(worlds);
  sanitized['teams'] = worlds;
  //headers.set('worlds',worlds);
  //sanitized.set('headers',headers);

  return sanitized;
}

const interval	= 5000;
const tick	= 500;
var last_update	= 0;
var sanitized	= undefined;
var max_loops	= 20;

function updateStatus() {
  if (ws.running) {
    // console.log(Date.now() + ' >= ' + (last_update + interval) + ": " + (Date.now() >= (last_update + interval)));
    if (Date.now() >= (last_update+interval)) {
      // console.log('updating');
      $.get(ws.status_url,function(data) {
	last_update = Date.now();
	sanitized = sanitizeData(data,ws.mapObjectives);
	//console.log(sanitized);
	ws.updateWorld(sanitized);
      });
    } else {
      ws.updateWorld(sanitized);
    }
  } else if (ws.finished) {
    ws.matchCompleted();
  }
  if (max_loops > 0) {
    max_loops = max_loops - 1;
  } else {
    ws.matchCompleted();
  }
}

/*
class World {
  constructor(select,go) {
    this._select  = $(select);
    this._go	  = $(go);
  }
}
*/

$.when(
  $.getJSON( "world_names_en.json", function(data) {
    ws.worlds = data;
    var found = data.find(function(elem) { return elem.name === 'Crystal Desert' })
    ws.worldId(found.id);
  }),
  $.getJSON( "maps.json", function(data) {
    ws.information = data;
  })
).then(function() {
  updateStatus();
  ws.interval(window.setInterval(updateStatus,tick));
});
