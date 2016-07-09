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
	    console.log(match);
	    ["red","green","blue"].forEach(function(color) {
	      console.log(match.all_worlds);
	      console.log(match.all_worlds[color]);
	      self.updateMatchCounts(color,sanitizeTeam(match.worlds[color],match.all_worlds[color]),match.scores[color], match.kills[color], match.deaths[color]);
	    });
	    self._.lastUpdate = Date.now();
	    self._.data = sanitizeMatch(match,self._.worlds,self._.objectives);
	    //console.log('update',self.url,self._.data);
	  })
	  .catch(function(error) {
	    console.log('There was an error retrieving match data', error);
	  });
      } else {
	//console.log('tick',self._.data);
	console.log('tick');
      }
      self.updateStatsDiv();
    }
  }
  updateStatsDiv() {
    this._.statusDiv.html('Last updated: <abbr title="' + moment(this.updated).toISOString() + '">' + moment(this.updated).fromNow() + '</abbr>');
  }
  updateMatchCounts(color,team,score,kills,deaths) {
    var self = this;
    var target = $("#"+color+".team");
    if (team.find(function(member){ return member.id == self._.wid; },self) != undefined) {
      if (! target.hasClass('selected')) {
	target.addClass('selected');
      }
    } else {
      target.removeClass('selected');
    }

    var content = "<div class='captain'>"+team[0].name+"</div>";
    content += "<div class='members' title='"+team.slice(1).map(function(e){ return e.name; }).join(' &amp; ')+"'> + friends</div>";
    content += "<div class='stats'>";
    content += "<div class='score'> s: "+score.toLocaleString()+" </div>";
    content += "<div class='kills'> k: "+kills.toLocaleString()+" </div>";
    content += "<div class='deaths'> d: "+deaths.toLocaleString()+" </div>";
    target.html(content);
    //$("#"+color+".team").html(content);
  }
}
