function sanitizeMatch(data,worlds,mapObjectives) {
  var sanitized	  = {};
  var teams	  = ['red','green','blue'];
  sanitized['current_time'] = Date.now();
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
  /*
  teams.forEach(function(color) {
    worlds.set(color,sanitizeTeam(data['worlds'][color],data['all_worlds'][color]));
  });
  */
  //console.log(worlds);
  sanitized['teams'] = worlds;
  //headers.set('worlds',worlds);
  //sanitized.set('headers',headers);

  return sanitized;
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
	details.then(function(detail) {
	  objective[key] = detail[key];
	});
	break;
    }
  });
  return objective;
}
function sanitizeTeam(primaryId, all_worlds) {
  var team	  = new Array();

  team.push(mapWorld(primaryId));
  var otherIds  = all_worlds.filter(function(elem) { return elem != primaryId; });
  otherIds.forEach(function(elem) { team.push(mapWorld(elem)); });

  return team;
}
function mapWorld(id) {
  return worlds.worlds.find(function(world) { return world.id === id });
}
