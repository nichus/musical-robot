function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}
class Status {
  constructor(id) {
    this.ready = new Promise.reject();
  }
  fetch() {
    function
    this.ready = new Promise(function(fulfill,reject) {
      fetch("https://api.guildwars2.com/v2/wvw/matches?world=" + this.world_id)
	.then(status)
	.then(function(request){ return request.json(); });
    });
  }
}
