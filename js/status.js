class MatchStatus {
  constructor() {
    this._		= {};
    this._.lastUpdate 	= 0;
    this._.tick		= 500;
    this._.interval	= 5000;
    this._.wid;
    this._.matchActive	= false;
    this._.baseURL	= 'https://api.guildwars2.com/v2/wvw/matches?world_id=';
  }
  start(wid) {
    if (this._.wid != wid) {
      this._.wid = wid;
    }
    this._.matchActive	= true;
    this._.lastUpdate	= 0;
  }
  stop() {
    this._.matchActive	= false;
  }
  get url {
    if (this._.wid != undefined) {
      return this._.baseURL + this._.wid;
    } else {
      return undefined;
    }
  }
  update() {
    if (this._.matchActive && (this.url != undefined)) {
      fetch(this.url)
	.then(status)
	.then(function(response) { return response.json() })
	.then(function(match) {
	})
	.catch(function(error) {
	  console.log('There was an error retrieving match data', error);
	});
    }
  }
}
