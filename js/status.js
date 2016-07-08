class MatchStatus {
  constructor(options={}) {
    this._		= {};
    this._.lastUpdate 	= 0;
    this._.data		= undefined;
    this._.tick		= 1000;
    this._.interval	= 5000;
    this._.wid;
    this._.matchActive	= false;
    this._.objectives	= new MapObjectives(options);
    this._.baseURL	= 'https://api.guildwars2.com/v2/wvw/matches?world=';
    this._.statusDiv	= $("#"+options['statusDiv']);
    if (options.local) {
      this._.baseURL = 'json/match.json.';
    }
  }
  start(worlds) {
    var self = this;
    console.log('Starting tracking world: '+worlds.world);
    if (this._.wid != worlds.world) {
      this._.wid = worlds.world;
    }
    this._.worlds	= worlds.worlds;
    this._.matchActive	= true;
    this._.lastUpdate	= 0;
    this._.intervalId	= window.setInterval(function() { self.update() },this._.tick);
  }
  stop() {
    this._.matchActive	= false;
    if (this._.intervalId !== undefined) {
      window.clearInterval(this._.intervalId);
      this._.intervalId	= undefined;
    }
  }
  get updated() {
    return this._.lastUpdate;
  }
  get url() {
    if (this._.wid != undefined) {
      return this._.baseURL + this._.wid;
    } else {
      return undefined;
    }
  }
  update() {
    var self = this;
    var fudge = this._.tick / 5.0;
    if (this._.matchActive && (this.url != undefined)) {
      if ((Date.now() - self.updated)+fudge >= self._.interval) {
	//console.log('update: '+this.url);
	fetch(this.url)
	  .then(status)
	  .then(function(response) { return response.json() })
	  .then(function(match) {
	    //console.log(match);
	    self._.lastUpdate = Date.now();
	    self._.data = sanitizeMatch(match,self._.worlds,self._.objectives);
	    console.log('update',self.url,self._.data);
	  })
	  .catch(function(error) {
	    console.log('There was an error retrieving match data', error);
	  });
      } else {
	console.log('tick',self._.data);
      }
    }
  }
}
