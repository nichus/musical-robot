class Watcher { // {{{
/*`
function WvWWatcher(stat,pause) { // {{{
  function findMatch(id) {
    if (id == null) {
      console.log("World ID not defined");
      return;
    }
    var url = "https://api.guildwars2.com/v2/wvw/matches?world="+id;

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var match = JSON.parse(xmlhttp.responseText);
        var matches = response['wvw_matches'];
        for (var i=0; i<matches.length; i++) {
          if ((matches[i].red_world_id == id) || (matches[i].blue_world_id == id) || (matches[i].green_world_id == id)) {
            match_id        = matches[i].wvw_match_id;
            match_end_time  = Date.parse(matches[i].end_time);
          }
        }
        checkStatus();
        statusInterval = window.setInterval(checkStatus, 10000);
      }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
  function checkStatus() { // {{{
    var url       = "https://api.guildwars2.com/v2/wvw/matches?world=" + world_id;

    if (match_end_time != null && Date.now() > match_end_time) {
      stats.innerHTML = "Match completed, status updates halted.  Reload to monitor current match";
      window.clearInterval(statusInterval);
      return;
    }

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var status = JSON.parse(xmlhttp.responseText);
        //lookupGuilds(status);
        if (status['maps']) {
          var now = new Date();
          stats.innerHTML = "Last updated: " + now.toISOString();
          for (var i=0; i<status['maps'].length; i++) {
            if (status['maps'][i].type == "Center") {
              if (centerMap == null) {
                centerMap = new CenterMap('CenterHome',status['maps'][i],true);
              }
              centerMap.update(status['maps'][i]);
            } else if (status['maps'][i].type == 'RedHome') {
              if (redMap == null) {
                redMap = new HomeMap('RedHome',status['maps'][i],true);
              }
              redMap.update(status['maps'][i]);
            } else if (status['maps'][i].type == 'GreenHome') {
              if (greenMap == null) {
                greenMap = new HomeMap('GreenHome',status['maps'][i],true);
              }
              greenMap.update(status['maps'][i]);
            } else if (status['maps'][i].type == 'BlueHome') {
              if (blueMap == null) {
                blueMap = new HomeMap('BlueHome',status['maps'][i],true);
              }
              blueMap.update(status['maps'][i]);
            }
          }
        }
      }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  } // }}}
  function lookupGuilds(status) {
    status.maps.forEach(function(element,index,array) {
      element.objectives.forEach(function(objective,jndex,objectives)  {
        if (objective.hasOwnProperty('owner_guild')) {
          guilds.find(objective.owner_guild,function(g) { objective.guild = g; });
        }
      });
    });
  }
} // }}}

*/
