function WvWLogger(id,colors) {
  var notificationLimit = 50;
  var box               = document.getElementById(id);
  var iconmap           = {
                              'Camp':   'img/white_camp.png',
                              'Keep':   'img/white_keep.png',
                             'Tower':  'img/white_tower.png',
                            'Castle': 'img/white_castle.png'
                          };

  function formatTime(now) {
    return "" + now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds();
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
    icon.firstChild.setAttribute('src',iconmap[data.desc.type]);

    objective.setAttribute('class','log_objective ' + data.curr.owner.toLowerCase());
    objective.appendChild(document.createTextNode(data.desc.name));

    guild.setAttribute('class','log_guild');
    if (data.curr.guild) {
      var abbr = document.createElement('abbr');
      abbr.setAttribute('title',data.curr.guild.guild_name);
      abbr.appendChild(document.createTextNode('['+data.curr.guild.tag+']'));
      guild.appendChild(abbr);
    } else if (data.prev.guild) {
      guild.setAttribute('class','log_guild released');
      guild.appendChild(document.createTextNode('['+data.prev.guild.tag+']'));
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
