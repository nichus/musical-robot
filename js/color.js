class ApiColor {
  constructor() {
    this._ = {};
    var self = this;
  }

  color(id,material) {
    function status(response) {
      if (response.status >= 200 && response.status < 300) {
	return Promise.resolve(response)
      } else {
	return Promise.reject(new Error(response.statusText))
      }
    }
    function json(response) { return response.json() }
    return new Promise(function(fulfill,reject) {
      fetch('https://api.guildwars2.com/v2/colors/'+id).then(status).then(json).then(function(data) {
	fulfill(data[material].rgb);
      }).catch(function(response) { reject(new Error(response)) });
    });
  }
}

class ApiImage {
  constructor() {
    this._ = {};
    this._.fgs = new Map();
    this._.bgs = new Map();
    var self = this;
  }
  fetch(url) {
    function status(response) {
      if (response.status >= 200 && response.status < 300) {
	return Promise.resolve(response)
      } else {
	return Promise.reject(new Error(response.statusText))
      }
    }
    function json(response) { return response.json() }
    function imgify(item) { 
      var img = new Image();
      return new Promise(function(fulfill,reject) {
	img.addEventListener("load", function() { fulfill(img); });
	img.crossOrigin = "anonymous";
	img.src=item;
      });
    }
	
    return new Promise(function(fulfill,reject) {
      fetch(url).then(status).then(json).then(function(data) {
	var imgs = data[0]['layers'].map(function(u,i,l) { return imgify(u); });

	fulfill(Promise.all(imgs));
      }).catch(function(response) { reject(new Error(response)) });
    });
  }
  fg(id) {
    if (! this._.fgs.has(id) ) {
      this._.fgs[id] = this.fetch('https://api.guildwars2.com/v2/emblem/foregrounds?ids='+id);
    } 
    return this._.fgs[id];
  }
  bg(id) {
    if (! this._.bgs.has(id) ) {
      this._.bgs[id] = this.fetch('https://api.guildwars2.com/v2/emblem/backgrounds?ids='+id);
    } 
    return this._.bgs[id];
  }
}

function WvWGuilds() {
  var url         = 'https://api.guildwars2.com/v1/guild_details.json?guild_id=';
  var xmlhttp     = new XMLHttpRequest();
  var registrar  = {};

  // Instantiate Guild List, via HTML5 LocalStorage, if available
  load();

  function save() {
    localStorage.setItem('guild_registrar',JSON.stringify(registrar));
  }
  function load() {
    if (localStorage.getItem('guild_registrar')) {
      registrar = JSON.parse(localStorage.getItem('guild_registrar'));
    }
  }
  function store(guid,guild) {
    registrar[guid] = guild;
    save();
  }

  function fetch(guid,method) {
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var guild = JSON.parse(xmlhttp.responseText);
        store(guid,guild);
        method(guild);
        // console.log('fetched guild');
        // console.log(guild);
      }
    }

    xmlhttp.open("GET", url + guid, true);
    xmlhttp.send();
  }
  this.find = function(guid,method) {
    if (registrar.hasOwnProperty(guid)) {
      method(registrar[guid]);
    } else {
      fetch(guid,method);
    }
  };
}
// Usage in destination code:
//   guilds.find(guid,function(g) { data.guild = g; });
class Vexillographer {
  constructor() {
    this.guilds = new Map();
    if (localStorage.getItem('Vexillographer')) {
      this.guilds = JSON.parse();
    }
  }

  render(guild) {
    if (this.guilds.has(guild.guild_id)) {
      return this.guilds[guild.guild_id];
    } else {
      return this.create(guild.guild_id,guild.emblem);
    }
  }
}
