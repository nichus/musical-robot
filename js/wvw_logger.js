function WvWLogger(id,colors) {
  var notificationLimit = 50;
  var box               = document.getElementById(id);
  var iconmap           = {
                              'Camp':   'img/white_camp.png',
                              'Keep':   'img/white_keep.png',
                             'Tower':  'img/white_tower.png',
                            'Castle': 'img/white_castle.png'
                          };

  function formatEntry2(changes) {
    var template = _.template('<div class="event <%= captured_by %>"><table><tr class="line1"><td class="box" title="Points Per Tick"><div><%= ppt %></div></td><td class="box <%= captured_from %>"><div><img src="<%= action_img %>" height="16" width="16" title="<%= action_title %>"/></div></td><td><div><img height="18" width="18" src="<%= objective_img %>" title="<%= objective_title %>" /></div></td><td style="width: 100%;" title="Objective Name" class="objective_name"><%- objective_name %><img src="img/copy-link.svg" width="16" height="16" title="copy event"/></td><td class="box" align="right"><abbr class="log_guild <%= guild_release %>" title="<%- guild_name %>"><%= guild_abbr %></td></tr><!-- tr class="line2"><td colspan="5" title="Upgrades"><%= upgrades %></td></tr --></table></div>');
     
    // console.log(changes);
    var ec = template(changes);
    $("#logContainer2 div.update").append(ec);
  }

  function determineChanges(data) {
    var changed = { changed: false };

    if (data.prev == null) {
      return changed;
    }
    if ((data.prev.claimed_by == data.curr.claimed_by) && (data.prev.owner == data.curr.owner)) {
      return changed;
    }
    if (data.prev.owner != data.curr.owner) {
      changed.action_img  = 'img/captured.svg';
      changed.action_title = "captured";
    } else if (data.curr.guild) {
      changed.action_img  = 'img/guild_claim.png';
      changed.action_title = "claimed";
    } else if (data.prev.guild) {
      changed.action_img  = 'img/guild_release.png';
      changed.action_title = "released";
    } else {
      changed.action_img  = 'img/none.svg';
      changed.action_title = "";
    }
    
    changed.changed       = true;
    changed.captured_by   = data.curr.owner.toLowerCase();
    changed.captured_from = data.prev.owner.toLowerCase();
    changed.objective_img = data.curr.marker;
    changed.objective_title = data.curr.type;
    changed.objective_name = data.curr.name;
    changed.ppt           = data.curr.points_tick;
    changed.guild_release = "";
    if (data.curr.guild) {
      changed.guild_name  =  data.curr.guild.name;
      changed.guild_abbr  =  data.curr.guild.tag;
    } else if (data.prev.guild) {
      changed.guild_name  =  data.prev.guild.name;
      changed.guild_abbr  =  data.prev.guild.tag;
      changed.guild_release = "released";
    } else {
      changed.guild_name = "";
      changed.guild_abbr = "";
    }
    changed.upgrades = "";
    return changed;
  }
  function formatEntry(data) {
    //console.log(data);
    var item            = document.createElement('div');
    var icon            = document.createElement('div');
    var objective       = document.createElement('div');
    var from            = document.createElement('div');
    var guild           = document.createElement('div');
    var time            = document.createElement('div');
    var message         = document.createElement('div');
    var ppt             = document.createElement('div');
    var yak             = document.createElement('div');
    var upgrades        = document.createElement('div');

    /*
    if (!window.spammed) {
      console.log(data);
      window.spammed = true;
    }
    */
    if (data.prev == null) {
      return null;
    }

    if ((data.prev.claimed_by == data.curr.claimed_by) && (data.prev.owner == data.curr.owner)) {
      return null;
    }

    if ((data.prev.owner == data.curr.owner) && data.prev.claimed_by && !data.curr.claimed_by) {
    }

    from.setAttribute('class','log_from ' + data.prev.owner.toLowerCase());
    if (data.prev.owner != data.curr.owner) {
      from.appendChild(document.createElement('img'));
      from.firstChild.setAttribute('src','img/right_arrow.png');
    } else if (data.curr.guild) {
      from.appendChild(document.createElement('img'));
      from.firstChild.setAttribute('src','img/guild_claim.png');
    } else if (data.prev.guild) {
      from.appendChild(document.createElement('img'));
      from.firstChild.setAttribute('src','img/guild_release.png');
    } else {
      from.innerHTML = '&nbsp;';
    }
    
    icon.setAttribute('class','log_icon ' + data.curr.owner.toLowerCase());
    icon.appendChild(document.createElement('img'));
    icon.firstChild.setAttribute('src',iconmap[data.curr.type]);
    //icon.firstChild.setAttribute('src',data.curr.marker);

    objective.setAttribute('class','log_objective ' + data.curr.owner.toLowerCase());
    objective.appendChild(document.createTextNode(data.curr.name));

    ppt.setAttribute('class','log_ppt ' + data.curr.owner.toLowerCase());
    ppt.appendChild(document.createTextNode(data.curr.points_tick + '/' + data.curr.points_capture));

    guild.setAttribute('class','log_guild');
    if (data.curr.guild) {
      var abbr = document.createElement('abbr');
      abbr.setAttribute('title',data.curr.guild.name);
      abbr.appendChild(document.createTextNode('['+data.curr.guild.tag+']'));
      guild.appendChild(abbr);
    } else if (data.prev.guild) {
      var abbr = document.createElement('abbr');
      abbr.setAttribute('title',data.prev.guild.name);
      abbr.appendChild(document.createTextNode('['+data.prev.guild.tag+']'));
      guild.setAttribute('class','log_guild released');
      guild.appendChild(abbr);
    } else {
      guild.innerHTML="&nbsp;";
    }

    time.setAttribute('class','log_time');
    time.innerHTML=moment().utc().format("HH:mm:ss");

    message.setAttribute('class','log_message');
    if (data.message) {
      message.innerHTML=data.message;
    }

    item.setAttribute('class','log_item');

    item.appendChild(time);
    item.appendChild(from);
    item.appendChild(icon);
    item.appendChild(objective);
    item.appendChild(ppt);
    item.appendChild(guild);
    item.appendChild(message);

    return item;
  }
  this.log              = function(data) {
    entry = formatEntry(data);
    if (entry == null) {
      return;
    }
    if (!box.hasChildNodes()) {
      box.appendChild(entry);
    } else {
      if (box.childNodes.length > notificationLimit) {
        box.removeChild(box.lastChild);
      }
      box.insertBefore(entry,box.firstChild);
    }
    var changes = determineChanges(data);
    if (changes.changed) {
      formatEntry2(changes);
      console.log(data);
    }

    /*
    entry = document.createElement('li');
    if (data.message) 
    text  = document.createTextNode(data.message);
    entry.appendChild(text);
    if (!ul.hasChildNodes()) {
      ul.appendChild(entry);
    } else {
      if (ul.childNodes.length > notificationLimit) {
        ul.removeChild(ul.lastChild);
      }
      ul.insertBefore(entry,ul.firstChild);
    }
    */
  }
  this.reset		= function() {
    while (box.hasChildNodes()) {
      box.removeChild(box.lastChild);
    }
  }
}
