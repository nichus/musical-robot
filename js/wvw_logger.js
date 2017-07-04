class WvWLogUpdate {
  constructor() {
    this.target         = document.createElement('div');
    this.target.setAttribute('class','update');

    var header          = document.createElement('h1');
    var shifts          = document.createElement('div');
    shifts.setAttribute('class','changes');

    this.redshift       = document.createElement('div');
    this.blushift       = document.createElement('div');
    this.grnshift       = document.createElement('div');

    this.redshift.setAttribute('class','redshift');
    this.blushift.setAttribute('class','blushift');
    this.grnshift.setAttribute('class','grnshift');

    shifts.appendChild(this.redshift);
    shifts.appendChild(this.blushift);
    shifts.appendChild(this.grnshift);

    header.appendChild(shifts);
    header.appendChild(document.createTextNode(moment.utc().format('HH:mm:ss')));
    this.target.appendChild(header);

    this.redchange  = 0;
    this.bluchange  = 0;
    this.grnchange  = 0;

    this.castle = [];
    this.keep = [];
    this.tower = [];
    this.camp = [];
  }
  queue(type,changes) {
    if ((type == 'castle') || (type == 'keep') || (type == 'tower') || (type == 'camp')) {
      this[type].push(changes);
    }
  }
  publish() {
    var contents = 0;
    var template = _.template('<div class="event <%= captured_by %>"><table><div class="box" title="Points Per Tick"><%= ppt %></div><div class="box <%= captured_from %>"><img src="<%= action_img %>" height="16" width="16" title="<%= action_title %>"/></div><div class="box"><img height="18" width="18" src="<%= objective_img %>" title="<%= objective_title %>" /></div><div title="Objective Name" class="objective_name"><%- objective_name %><img src="img/copy-link.svg" width="16" height="16" title="copy event"/></div><div class="box guild" align="right"><abbr class="log_guild <%= guild_release %>" title="<%= guild_name %>"><%= guild_abbr %></abbr></div></div>');
    ['castle','keep','tower','camp'].forEach(function(e,i,l) {
      this[e].forEach(function(element,index,list) {
        $(this.target).append(template(element));
        switch (element.captured_from) {
          case 'red':
            this.redchange -= element.ppt;
            break;
          case 'blue':
            this.bluchange -= element.ppt;
            break;
          case 'green':
            this.grnchange -= element.ppt;
            break;
        }
        switch (element.captured_by) {
          case 'red':
            this.redchange += element.ppt;
            break;
          case 'blue':
            this.bluchange += element.ppt;
            break;
          case 'green':
            this.grnchange += element.ppt;
            break;
        }
        contents += 1;
        // console.log(element);
      },this);
    },this);

    this.redshift.appendChild(document.createTextNode(this.redchange));
    this.blushift.appendChild(document.createTextNode(this.bluchange));
    this.grnshift.appendChild(document.createTextNode(this.grnchange));

    if (contents > 0) {
      return this.target;
    }

    return "";
  }
}
class WvWLogger {
  constructor(which) {
    this.eventLimit     = 5;
    this.target         = $('#'+which);
    this.currentUpdate  = false;
  }
  nextUpdate() {
    if (this.currentUpdate) {
      return this.currentUpdate;
    }

    this.currentUpdate = new WvWLogUpdate();
    return this.currentUpdate;
  }
  appendEntry(changes) {
    if (this.currentUpdate) {
      this.currentUpdate.queue(changes.objective_title.toLowerCase(), changes);
    } else {
      console.log('no current update staged, cannot log:', changes);
    }
  }
  determineChanges(data) {
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
  log(data) {
    var changes = this.determineChanges(data);

    if (changes.changed) {
      this.appendEntry(changes);
    }
  }
  publish() {
    if (this.currentUpdate) {
      var dom = this.target.get().shift();
      if (dom.firstChild) {
        this.target.prepend(this.currentUpdate.publish());
        //dom.insertBefore(this.currentUpdate.publish(),dom.firstChild);
        if (dom.childNodes.length > this.eventLimit) {
          dom.removeChild(dom.lastChild);
        }
      } else {
        this.target.append(this.currentUpdate.publish());
      }
      this.currentUpdate = false;
    }
  }
  reset() {
    this.target.empty();
  }
}
