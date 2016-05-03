function WvWLogger(id,colors) { // {{{
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
      guild.appendChild(document.createTextNode('['+data.curr.guild.tag+']'));
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
} // }}}
function MyCanvas(id,grid) { // {{{
  this.canvas         = document.getElementById(       id);
  this.canvaswidth    = this.canvas.getAttribute( 'width');
  this.canvasheight   = this.canvas.getAttribute('height');
  this.width          = this.canvaswidth;
  this.height         = this.canvasheight;
  this.colors         = new Colors();

  if (this.width  % 2 == 0) this.width  -= 1;
  if (this.height % 2 == 0) this.height -= 1;

  this.cx       = this.width  / 2.0;
  this.cy       = this.height / 2.0;
  if (this.canvas.getContext) {
    this.context  = this.canvas.getContext(      '2d');
  } else {
    return null;
  }

  this.worlds = function(worlds) {
    var textStart = 5
    var textLeft  = 5;
    this.context.font = "10px Serif";
    worlds.forEach(function(world) {
      this.context.fillText(world)
      textStart = textStart + 12;
    }, this);
  }
  this.worldGradient = function(world,gradient) {
    var whiteStop = 0.2;
    var colorStop = 0.8;
    switch (world) {
      case "RedHome":
	color = this.colors.transred();
	break;
      case "GreenHome":
	color = this.colors.transgreen();
	break;
      case "BlueHome":
	color = this.colors.transblue();
	break;
      case "Center":
      default:
	color = this.colors.eb();
	whiteStop = 0.35;
	colorStop = 0.6;
    }

    gradient.addColorStop(whiteStop, "white");
    gradient.addColorStop(colorStop, color);
  };

  this.drawBackground = function(world) {
    this.canvas.width = this.canvas.width;
    gradient = this.context.createRadialGradient(this.cx,this.cy,1,this.cx,this.cy,140);

    this.worldGradient(world,gradient);

    this.context.fillStyle = gradient;
    this.context.fillRect(0,0,this.canvaswidth,this.canvasheight);

    if (grid) {
      this.context.strokeStyle = "#000";
      this.context.beginPath();
      this.context.moveTo(0,this.cy);
      this.context.lineTo(this.canvaswidth,this.cy);
      this.context.moveTo(this.cx,0);
      this.context.lineTo(this.cx,this.canvasheight);
      this.context.stroke();
    }
  };
  function Colors() { // {{{
    var red     = "#df0101"; var transred   = "rgba( 223,   1,   1, 0.5 )";
    var green   = "#088a08"; var transgreen = "rgba(   8, 138,   8, 0.5 )";
    var blue    = "#2e64fe"; var transblue  = "rgba(  46, 100, 254, 0.5 )";
    var white   = "#fafafa"; var transwhite = "rgba( 250, 250, 250, 0.7 )";
    var black   = "#333333"; var transblack = "rgba(  51,  51,  51, 0.7 )";
    var eb      = "#cccccc";
    var yellow  = "#eeee05";

    this.red          = function() { return        red; };
    this.green        = function() { return      green; };
    this.blue         = function() { return       blue; };
    this.white        = function() { return      white; };
    this.black        = function() { return      black; };
    this.yellow       = function() { return     yellow; };
    this.eb           = function() { return         eb; };

    this.transred     = function() { return   transred; };
    this.transgreen   = function() { return transgreen; };
    this.transblue    = function() { return  transblue; };
    this.transwhite   = function() { return transwhite; };
    this.transblack   = function() { return transblack; };
  } // }}}
} // }}}

function Castle(myc,count,desc) { // {{{
  var size          = 27;
  var canvas        = myc;
  var description   = desc;
  var status        = null;

  var captured_at   = 0;
  this.id           = desc.id;

  function draw(stroke,fill) { // {{{
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.arc(canvas.cx,canvas.cy,size,0,Math.PI*2,false);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();

    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-24,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-18,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-12,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-7,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 0:
	ctx.lineWidth=2;
	ctx.beginPath();
	ctx.arc(canvas.cx,canvas.cy,size-1,0,Math.PI*2,false);
	ctx.stroke();
	ctx.lineWidth=1;
    }
  } // }}}
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(description.id+": "+description.type+"/"+description.name); }
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    this.captured_at = (Date.parse(st.last_flipped) / 1000);
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
  } // }}}
} // }}}
function Keep(myc,count,desc) { // {{{
  var size          = 55;
  var canvas        = myc;
  var width         = (count==2) ? Math.PI/4.0 : Math.PI/6.0;
  var sites         = count * 1.0;
  var description   = desc;
  var status        = null;
  var updated	    = 0;

  var captured_at   = 0;
  this.id           = desc.id;

  if (description.map_type != "Center") {
    sites = sites - 1;
  }

  function rotation() {
    if (description.map_type == "Center") {
      return -Math.PI/2.0;
    }
    return 0;
  }

  function angle() {
    return (description.index*(2*Math.PI)/sites) + rotation();
  }
  function angle1() {
    return angle() - width/2.0;
  }
  function angle2() {
    return angle() + width/2.0;
  }
  function draw(stroke,fill) { // {{{
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  } // }}}
  function righteous_indignation() {//{{{
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }//}}}
  this.report = function() { console.log(description.id+": "+description.type+"/"+description.name); }
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    this.captured_at = (Date.parse(st.last_flipped) / 1000);
    if (st.claimed_by != null && st.claimed_at != null && Date.parse(st.claimed_at) > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':desc.type.toLowerCase() + ' ' + desc.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  } // }}}
} // }}}
function Tower(myc,count,desc) { // {{{
  var size          = 65;
  var canvas        = myc;
  var width         = Math.PI/10.0;
  var sites         = count * 1.0;
  var description   = desc;
  var index         = description.index;
  var status        = null;
  var updated	    = 0;

  var captured_at   = 0;
  this.id           = desc.id;

  function rotation() {
    if (description.map_type == "Center") {
      return -Math.PI/6.0;
    }
    return 0;
  }

  function angle() {
    return (description.index*(2*Math.PI)/sites) - Math.PI/4.0 + rotation();
  }
  function angle1() {
    return angle() - width/2.0;
  }
  function angle2() {
    return angle() + width/2.0;
  }
  function draw(stroke,fill) { // {{{
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch (true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  } // }}}
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(description.id+": "+description.type+"/"+description.name); }
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    captured_at = (Date.parse(st.last_flipped) / 1000);
    if (st.claimed_by != null && st.claimed_at != null && Date.parse(st.claimed_at) > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':desc.type.toLowerCase() + ' ' + desc.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  }; // }}}
} // }}}
function Camp(myc,count,desc) { // {{{
  var size          = 90;
  var canvas        = myc;
  var width         = Math.PI/18.0;
  var description   = desc;
  var sites	    = count * 1.0;

  var status        = null;
  var captured_at   = 0;
  var updated	    = 0;
  this.id           = desc.id;

  function report() { console.log(description.id+": "+description.type+"/"+description.name+"["+description.index+"]"); }
  this.report = function() { report(); }
  function rotation() {//{{{
    if (description.map_type == "Center") {
      return Math.PI/6.0;
    }
    return 0;
  }//}}}
  function angle() {//{{{
    return (description.index*(2*Math.PI)/sites) + rotation()-Math.PI/2.0;
  }//}}}
  function angle1() {//{{{
    return angle()-(width/2.0);
  }//}}}
  function angle2() {//{{{
    return  angle()+(width/2.0);
  }//}}}
  function draw(stroke,fill) { // {{{
    var ctx         = canvas.context;
    var ri          = righteous_indignation();
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
    ctx.lineTo(canvas.cx,canvas.cy);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();
    switch(true) {
      case ri > 180:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      case ri > 120:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      case ri > 60:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      case ri > 30:
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      case ri > 0:
	ctx.beginPath();
	ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
	ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
	ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
	ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
	ctx.fill();
	ctx.stroke();
    }
  } // }}}
  function righteous_indignation() {//{{{
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }//}}}
  this.update = function(st,logger) { // {{{
    logger.log({'desc': description, 'prev': status, 'curr': st});
    captured_at = (Date.parse(st.last_flipped) / 1000);
    if (st.claimed_by != null && st.claimed_at != null && Date.parse(st.claimed_at) > updated) {
      if (st.guild) {
        logger.log({'guild': st.guild, 'message':desc.type.toLowerCase() + ' ' + desc.name});
      }
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
    updated = Date.now();
  } // }}}
} // }}}
function Ruin(myc,count,desc) { // {{{
  var size          = 35;
  var stepsize      = Math.PI*2/count;
  var width         = stepsize*.90;
  var spacer        = (stepsize-width)/2.0;
  var angle1        = (stepsize)*desc.index-(Math.PI*2)/4.0+spacer;
  var angle2        = (stepsize)*(desc.index+1)-(Math.PI*2)/4.0-spacer;
  var canvas        = myc;
  var description   = desc;
  var status        = null;

  this.id           = desc.id;
  this.captured_at  = null;

  function draw(stroke,fill) { // {{{
    ctx = canvas.context;
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;
    ctx.beginPath();
    ctx.moveTo(canvas.cx,canvas.cy);
    ctx.lineTo(canvas.cx+Math.cos(angle1)*size, canvas.cy+Math.sin(angle1)*size);
    ctx.arc(canvas.cx,canvas.cy,size,angle1,angle2,false);
    ctx.lineTo(canvas.cx, canvas.cy);
    ctx.fill();
    ctx.stroke();
  } // }}}
  this.update = function(st) { // {{{
    if (status && (status.owner != st.owner)) {
      this.captured_at = Date.now();
    }
    status = st;

    if (status.owner == "Red") {
      draw(myc.colors.transblack(),myc.colors.red());
    } else if (status.owner == "Green") {
      draw(myc.colors.transblack(),myc.colors.green());
    } else if (status.owner == "Blue") {
      draw(myc.colors.transblack(),myc.colors.blue());
    } else {
      draw(myc.colors.transblack(),myc.colors.white());
    }
  } // }}}
} // }}}
function WvWGuilds() {//{{{
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
}//}}}
class WvWMap {//{{{
  constructor(which) {
    this.name	    = which;
    this.objectives = null;
    this.details    = null;
    this.status	    = null;
    this.info	    = null;
    this.graph	    = which.replace("Center","CenterHome");
    this.canvas	    = new MyCanvas(this.graph,true);
    this.logger	    = new WvWLogger(this.graph.replace('Home','Log'),this.canvas.colors);
    this.infoURL    = 'https://api.guildwars2.com/v2/maps/';
  }
  updateStatus(newStatus,newMap=false,info) {//{{{
    if (newMap) {
      console.log(this.name+ " new Map detected");
      var o = new Objectives();
      this.details = o.map_id(newStatus.id);
      this.objectives = new Map([['Camp', []],['Tower', []],['Keep', []],['Castle', []],['Ruins', []]]);
      this.info = info;
      o.map_id(newStatus.id).forEach(function(e,i,l) {
	if (e.type === "Camp") {
	    this.objectives.get('Camp').push(
	      new Camp(this.canvas,o.type(newStatus.id,'Camp').length,o.id(e.id))
	    );
	} else if (e.type === "Tower") {
	    this.objectives.get('Tower').push(
	      new Tower(this.canvas,o.type(newStatus.id,'Tower').length,o.id(e.id))
	    );
	} else if (e.type === "Keep" && ! e.id.endsWith('-113')) {
	    this.objectives.get('Keep').push(
	      new Keep(this.canvas,o.type(newStatus.id,'Keep').length,o.id(e.id))
	    );
	} else if (e.type === "Castle" || (e.type === "Keep" && e.id.endsWith('-113'))) {
	    this.objectives.get('Castle').push(
	      new Castle(this.canvas,o.type(newStatus.id,'Castle').length,o.id(e.id))
	    );
	} else if (e.type === "Ruins") {
	    this.objectives.get('Ruins').push(
	      new Ruins(this.canvas,o.type(newStatus.id,'Ruins').length,o.id(e.id))
	    );
	}
      },this);
    }
    this.status = newStatus;
    this.draw();
  }//}}}
  set information(data) {
    this.info = data;
  }
  get information() {
    return this.info;
  }
  draw() {//{{{
    this.canvas.drawBackground(this.name);
    //['Camp','Tower','Keep','Castle','Ruins'].forEach(function(type) {
    ['Camp','Tower','Keep','Castle'].forEach(function(type) {
      this.objectives.get(type).forEach(function(objective) {
	var tgt = this.status.objectives.find(function(obj) { return obj.id == objective.id });
	objective.update(tgt,this.logger);
      },this);
    },this);
  }//}}}
}//}}}
class WorldStatus {//{{{
  constructor(statusDiv) {
    this.statdiv	  = $("#"+statusDiv);
    this.world_id	  = null;
    this.match_id	  = null;
    this.status		  = null;
    this.interval_id	  = null;
    this.last_update	  = 0;
    this.scores		  = new Map([['red',0],['blue',0],['green',0]]);
    this.maps		  = new Map();
    this.team		  = null;
    this.end_time	  = 0;
    this.mapInfo	  = null;

    ['Center','RedHome','BlueHome','GreenHome'].forEach(function(m,i,l) {
      this.maps[m] = new WvWMap(m);
    },this);
  }

  get endTime() {//{{{
    return this.end_time;
  }//}}}
  get finished() {//{{{
    return Date.now() > this.endTime;
  }//}}}
  get worldId() {//{{{
    if (this.running) {
      return this.world_id;
    }
    return null;
  }//}}}
  get running() {//{{{
    return this.last_update == 0 || ((this.match_id != null) && !this.finished);
  }//}}}
  get lastUpdate() {//{{{
    return this.last_update;
  }//}}}
  get status_url() {//{{{
    if (this.world_id != null) {
      return "https://api.guildwars2.com/v2/wvw/matches?world=" + this.world_id;
    }
    return null;
  }//}}}
  set information(info) {//{{{
    if (info) {
      this.mapInfo = info;
    }
  }//}}}
  set worlds(info) {//{{{
    if (info) {
      this.team = info;
    }
  }//}}}
  get worlds() {//{{{
    return this.team;
  }//}}}

  interval(id) {//{{{
    this.interval_id = id;
  }//}}}
  worldId(id) {//{{{
    this.world_id = id;
  }//}}}
  matchCompleted() {//{{{
    this.statdiv.html("Match completed, status updates halted.  Reload to monitor current match");
    clearInterval(this.interval_id);
    this.interval_id = null;
  }//}}}
  lookupGuilds(newStatus) {//{{{
    newStatus.maps.forEach(function(element,i,l) {
      element.objectives.forEach(function(objective,j,m) {
	if (objective.claimed_by != null) {
	}
      },this);
    },this);
  }//}}}
  updateWorld(newStatus) {//{{{
    this.lookupGuilds(newStatus);
    var now = new Date();
    var newMap = false;
    this.statdiv.html("Last updated: " + now.toISOString());
    if (this.match_id != newStatus.id) {
      this.match_id = newStatus.id;
      newMap = true;
    }
    this.end_time = Date.parse(newStatus.end_time);
    this.status = newStatus;
    newStatus.maps.forEach(function(map,index,rawMaps) {
      var info = this.mapInfo.find(function(elem) { return elem.id ===  map.id });
      this.maps[map.type].updateStatus(map,newMap,info);
    },this);
    this.scores = status.scores;
    this.last_update = new Date();
  }//}}}
}//}}}

var ws	    = new WorldStatus('stats');
var guilds  = new WvWGuilds();

function sanitizeObjective(objective) {
  ['id','owner','type','claimed_at','claimed_by','last_flipped'].forEach(function(key) {
    switch (key) {
      case 'id':
	var parts = objective[key].split('-');
	objective['map_id'] = parts[0];
	objective['obj_id'] = parts[1];
	break;
      case 'claimed_at':
      case 'last_flipped':
	objective[key] = Date.parse(objective[key]);
	break;
      case 'claimed_by':
	if (objective[key] != null) {
	  guilds.find(objective[key],function(g) { objective['guild'] = g; });
	}
	break;
      case 'type':
      case 'owner':
	break;
    }
  });
  return objective;
}
function sanitizeMap(map) {
  var newMap = new Map();
  var teams	= ['red','green','blue'];
  ['id','bonuses','deaths','kills','objectives','scores','type'].forEach(function(key) {
    switch(key) {
      case 'id':
      case 'type':
      case 'bonuses':
	newMap[key] = map[key];
	break;
      case 'deaths':
      case 'kills':
      case 'scores':
	newMap[key] = new Map();
	teams.forEach(function(color) { newMap[key][color] = map[key][color]; });
	break;
      case 'objectives':
	newMap[key] = new Array();
	map[key].forEach(function(objective) { newMap[key].push(sanitizeObjective(objective)) });
	break;
    }
  });
  return newMap;
}
function sanitizeData(data) {
  var sanitized = new Map();
  var teams	= ['red','green','blue'];
  ['id','start_time','end_time','scores','worlds','all_worlds','kills','deaths','maps'].forEach(function(key) {
    switch (key) {
      case 'id':
	sanitized[key] = data[key];
	break
      case 'start_time':
      case 'end_time':
	sanitized[key] = Date.parse(data[key]);
	break;
      case 'scores':
      case 'worlds':
      case 'all_worlds':
      case 'kills':
      case 'deaths':
	sanitized[key] = new Map();
	teams.forEach(function(color) { sanitized[key].set(color, data[key][color]); });
	break;
      case 'maps':
	sanitized[key] = new Array();
	data[key].forEach(function(map,i) {
	  sanitized[key][i] = sanitizeMap(map);
	});
	break;
      default:
	console.log('Unexpected match key: \''+key+'\'');
    }
  });
  return sanitized;
}

function updateStatus() {
  if (ws.running) {
    $.get(ws.status_url,function(data) {
      //console.log(sanitizeData(data));
      ws.updateWorld(data);
    });
  } else if (ws.finished) {
    ws.matchCompleted();
  }
}

$.when(
  $.getJSON( "world_names_en.json", function(data) {
    ws.worlds = data;
    var found = data.find(function(elem) { return elem.name === 'Crystal Desert' })
    ws.worldId(found.id);
  }),
  $.getJSON( "maps.json", function(data) {
    ws.information = data;
  })
).then(function() {
  updateStatus();
  ws.interval(window.setInterval(updateStatus,20000));
});

