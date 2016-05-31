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

