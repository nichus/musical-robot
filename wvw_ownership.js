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

    if ((data.prev.owner_guild == data.curr.owner_guild) && (data.prev.owner == data.curr.owner)) {
      return null;
    }

    if ((data.prev.owner == data.curr.owner) && data.prev.owner_guild && !data.curr.owner_guild) {
      console.log('released!');
      console.log(data);
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
    objective.appendChild(document.createTextNode(data.desc.en));

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
function CenterMap(id,status,grid) { // {{{
  var canvas      = new MyCanvas(id,grid);
  var ctx         = canvas.context;
  var size        = 70;
  var castle      = null;
  var counts      = { 'camps': 6, 'towers': 12, 'keeps': 3, 'castles': 1 };
  var keeps       = new Array();
  var towers      = new Array();
  var camps       = new Array();
  var ruins       = new Array();
  var objectives  = new Array();
  var draworder   = { 'camps': [], 'towers': [], 'keeps': [], 'castles': [] };
  var strokeStyle = null;
  var fillStyle   = null;
  var mapstatus   = status;
  var logger      = new WvWLogger('CenterLog',canvas.colors);

  if (canvas == null) {
    return;
  }

  for (var i=0; i<mapstatus['objectives'].length; i++) {
    objective   = mapstatus['objectives'][i];
    description = MapDetails.description(objective.id);
    if (description.type == "Camp") {
      camps[description.index]  = new Camp(canvas,counts['camps'],description);
      objectives[i]             = camps[description.index];
      draworder['camps'].push(camps[description.index]);
    } else if (description.type == "Tower") {
      towers[description.index] = new Tower(canvas,counts['towers'],description);
      objectives[i]             = towers[description.index];
      draworder['towers'].push(towers[description.index]);
    } else if (description.type == "Keep") {
      keeps[description.index]  = new Keep(canvas,counts['keeps'],description);
      objectives[i]             = keeps[description.index];
      draworder['castles'].push(keeps[description.index]);
    } else if (description.type == "Castle") {
      castle                    = new Castle(canvas,counts['castles'],description);
      objectives[i]             = castle;
      draworder['castles'].push(castle);
    }
  }

  function draw() {
    gradient = ctx.createRadialGradient(canvas.cx,canvas.cy,1,canvas.cx,canvas.cy,140);

    gradient.addColorStop(.35, "white");
    gradient.addColorStop(.6, canvas.colors.eb());

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.canvaswidth,canvas.canvasheight);

    for (var i=0; i<draworder['camps'].length; i++) {
      draworder['camps'][i].update(which_objective(draworder['camps'][i].id),logger);
    }
    for (var i=0; i<draworder['keeps'].length; i++) {
      draworder['keeps'][i].update(which_objective(draworder['keeps'][i].id),logger);
    }
    for (var i=0; i<draworder['towers'].length; i++) {
      draworder['towers'][i].update(which_objective(draworder['towers'][i].id),logger);
    }
    for (var i=0; i<draworder['castles'].length; i++) {
      draworder['castles'][i].update(which_objective(draworder['castles'][i].id),logger);
    }
  }

  this.update = function(status) { // {{{
    canvas.canvas.width = canvas.canvas.width;
    mapstatus = status;

    draw();
  } // }}}

  function which_objective(id) {
    for (var i=0; i< mapstatus['objectives'].length; i++) {
      if (mapstatus['objectives'][i].id == id) {
        return mapstatus['objectives'][i];
      }
    }
  }
  function configureContext() {
    ctx.strokeStyle = canvas.colors.eb();
    ctx.fillStyle   = canvas.colors.eb();
  }
} // }}}
function HomeMap(id,status,grid) { // {{{
  var canvas      = new MyCanvas(id,grid);
  var ctx         = canvas.context;
  var size        = 70;
  var counts      = { 'camps': 6, 'towers': 4, 'keeps': 2, 'castles': 1 };
  var keeps       = new Array();
  var towers      = new Array();
  var camps       = new Array();
  var ruins       = new Array();
  var objectives  = new Array();
  var draworder   = { 'ruins': [], 'camps': [], 'towers': [], 'keeps': [], 'castles': [] };
  var strokeStyle = null;
  var fillStyle   = null;
  var mapstatus   = status;
  var logger      = new WvWLogger(id.replace('Home','Log'),canvas.colors);

  if (canvas == null) {
    return;
  }

  for (var i=0; i<mapstatus['objectives'].length; i++) {
    objective   = mapstatus['objectives'][i];
    description = MapDetails.description(objective.id);
    if (description.type == "Ruin") {
      ruins[description.index]  = new Ruin(canvas,5,description);
      objectives[i]             = ruins[description.index];
      draworder['ruins'].push(ruins[description.index]);
    } else if (description.type == "Camp") {
      camps[description.index]  = new Camp(canvas,counts['camps'],description);
      objectives[i]             = camps[description.index];
      draworder['camps'].push(camps[description.index]);
    } else if (description.type == "Tower") {
      towers[description.index] = new Tower(canvas,counts['towers'],description);
      objectives[i]             = towers[description.index];
      draworder['towers'].push(towers[description.index]);
    } else if (description.type == "Keep") {
      if (description.index == 0) {
        // Garrison
        keeps[description.index]  = new Castle(canvas,counts['castles'],description);
        objectives[i]             = keeps[description.index];
        draworder['castles'].push(keeps[description.index]);
      } else {
        keeps[description.index]  = new Keep(canvas,counts['keeps'],description);
        objectives[i]             = keeps[description.index];
        draworder['keeps'].push(keeps[description.index]);
      }
    }
  }

  function draw() {
    configureContext();
    chosen_color = ctx.strokeStyle;
    gradient = ctx.createRadialGradient(canvas.cx,canvas.cy,1,canvas.cx,canvas.cy,140);

    gradient.addColorStop(.2, "white");
    gradient.addColorStop(.8, chosen_color);

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.canvaswidth,canvas.canvasheight);

    for (var i=0; i<draworder['camps'].length; i++) {
      draworder['camps'][i].update(which_objective(draworder['camps'][i].id),logger);
    }
    for (var i=0; i<draworder['keeps'].length; i++) {
      draworder['keeps'][i].update(which_objective(draworder['keeps'][i].id),logger);
    }
    for (var i=0; i<draworder['towers'].length; i++) {
      draworder['towers'][i].update(which_objective(draworder['towers'][i].id),logger);
    }
    for (var i=0; i<draworder['ruins'].length; i++) {
      draworder['ruins'][i].update(which_objective(draworder['ruins'][i].id));
    }
    for (var i=0; i<draworder['castles'].length; i++) {
      draworder['castles'][i].update(which_objective(draworder['castles'][i].id),logger);
    }
  }

  this.update = function(status) { // {{{
    canvas.canvas.width = canvas.canvas.width;
    mapstatus = status;

    draw();
  } // }}}

  function which_objective(id) {
    for (var i=0; i< mapstatus['objectives'].length; i++) {
      if (mapstatus['objectives'][i].id == id) {
        return mapstatus['objectives'][i];
      }
    }
  }
  function configureContext() {
    if (mapstatus.type == "RedHome") {
      ctx.strokeStyle = canvas.colors.transred();
      ctx.fillStyle   = canvas.colors.transred();
    } else if (mapstatus.type == "GreenHome") {
      ctx.strokeStyle = canvas.colors.transgreen();
      ctx.fillStyle   = canvas.colors.transgreen();
    } else if (mapstatus.type == "BlueHome") {
      ctx.strokeStyle = canvas.colors.transblue();
      ctx.fillStyle   = canvas.colors.transblue();
    }
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

  if (grid) {
    this.context.strokeStyle = "#000";
    this.context.beginPath();
    this.context.moveTo(0,this.cy);
    this.context.lineTo(this.canvaswidth,this.cy);
    this.context.moveTo(this.cx,0);
    this.context.lineTo(this.cx,this.canvasheight);
    this.context.stroke();
  }
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

//CenterMap.prototype = new Map();
//HomeMap.prototype   = new Map();

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

    if (ri > 0) { // nonzero RI remains
      ctx.lineWidth=2;
      ctx.strokeStyle = canvas.colors.yellow();
      ctx.fillStyle   = canvas.colors.yellow();
      ctx.beginPath();
      ctx.arc(canvas.cx,canvas.cy,size-1,0,Math.PI*2,false);
      ctx.stroke();
      ctx.lineWidth=1;

      if (ri > 30) {
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-7,0,Math.PI*2,false);
        ctx.stroke();
      }

      if (ri > 60) {
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-12,0,Math.PI*2,false);
        ctx.stroke();
      }

      if (ri > 120) {
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-18,0,Math.PI*2,false);
        ctx.stroke();
      }

      if (ri > 180) {
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-24,0,Math.PI*2,false);
        ctx.stroke();
      }
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
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    if (status && (status.owner != st.owner)) {
      this.captured_at = (Date.now() / 1000);
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
function Keep(myc,count,desc) { // {{{
  var size          = 55;
  var canvas        = myc;
  var width         = (count==2) ? Math.PI/4.0 : Math.PI/6.0;
  var sites         = count * 1.0;
  var description   = desc;
  var status        = null;
  var index         = description.index;
  var rotation      = 0;

  var captured_at   = 0;
  this.id           = desc.id;

  if (description.map == "Center") {
    rotation = -Math.PI/2.0;
  } else {
    index = index - 1; // Borderlands handle garrison as a castle
  }

  function angle1() {
    return (index*(2*Math.PI)/sites)-width/2.0 + rotation;
  }
  function angle2() {
    return (index*(2*Math.PI)/sites)+width/2.0 + rotation;
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

    if (ri > 0) { // nonzero RI remains
      ctx.strokeStyle = canvas.colors.yellow();
      ctx.fillStyle   = canvas.colors.yellow();
      ctx.beginPath();
      ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
      ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
      ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.fill();
      ctx.stroke();

      if (ri > 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      }

      if (ri > 60) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      }

      if (ri > 120) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      }

      if (ri > 180) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      }
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
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    if (status && (status.owner != st.owner)) {
      this.captured_at = (Date.now() / 1000);
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
function Tower(myc,count,desc) { // {{{
  var size          = 65;
  var canvas        = myc;
  var width         = Math.PI/10.0;
  var sites         = count * 1.0;
  var description   = desc;
  var index         = description.index;
  var status        = null;
  var rotation      = 0;

  var captured_at   = 0;
  this.id           = desc.id;

  if (description.map == "Center") {
    rotation =  -Math.PI/6.0;
  }

  function angle1() {
    return (description.index*(2*Math.PI)/sites)-Math.PI/4.0-width/2.0 + rotation;
  }
  function angle2() {
    return (description.index*(2*Math.PI)/sites)-Math.PI/4.0+width/2.0 + rotation;
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

    if (ri > 0) { // nonzero RI remains
      ctx.strokeStyle = canvas.colors.yellow();
      ctx.fillStyle   = canvas.colors.yellow();
      ctx.beginPath();
      ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
      ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
      ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.fill();
      ctx.stroke();

      if (ri > 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      }

      if (ri > 60) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      }

      if (ri > 120) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      }

      if (ri > 180) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      }
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
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    if (status && (status.owner != st.owner)) {
      captured_at = (Date.now() / 1000);
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
  }; // }}}
} // }}}
function Camp(myc,count,desc) { // {{{
  var size          = 90;
  var canvas        = myc;
  var width         = Math.PI/18.0;
  var sites         = count * 1.0;
  var description   = desc;
  var rotation      = 0;

  var status        = null;
  var owner_guild   = null;
  var captured_at   = 0;
  this.id           = desc.id;

  if (description.map == "Center") {
    rotation = Math.PI/6.0;
  }
  function angle1() {
    return (description.index*(2*Math.PI)/sites)-Math.PI/2.0-width/2.0 + rotation;
  }
  function angle2() {
    return (description.index*(2*Math.PI)/sites)-Math.PI/2.0+width/2.0 + rotation;
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

    if (ri > 0) { // nonzero RI remains
      ctx.strokeStyle = canvas.colors.yellow();
      ctx.fillStyle   = canvas.colors.yellow();
      ctx.beginPath();
      ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*size, canvas.cy+Math.sin(angle1())*size);
      ctx.arc(canvas.cx,canvas.cy,size,angle1(),angle2(),false);
      ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-2), canvas.cy+Math.sin(angle2())*(size-2));
      ctx.lineTo(canvas.cx+Math.cos(angle1())*(size-2), canvas.cy+Math.sin(angle1())*(size-2));
      ctx.fill();
      ctx.stroke();

      if (ri > 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-7), canvas.cy+Math.sin(angle1())*(size-7));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-7), canvas.cy+Math.sin(angle2())*(size-7));
        ctx.stroke();
      }

      if (ri > 60) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-12), canvas.cy+Math.sin(angle1())*(size-12));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-12), canvas.cy+Math.sin(angle2())*(size-12));
        ctx.stroke();
      }

      if (ri > 120) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-18), canvas.cy+Math.sin(angle1())*(size-18));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-18), canvas.cy+Math.sin(angle2())*(size-18));
        ctx.stroke();
      }

      if (ri > 180) {
        ctx.beginPath();
        ctx.moveTo(canvas.cx+Math.cos(angle1())*(size-24), canvas.cy+Math.sin(angle1())*(size-24));
        ctx.lineTo(canvas.cx+Math.cos(angle2())*(size-24), canvas.cy+Math.sin(angle2())*(size-24));
        ctx.stroke();
      }
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
  this.update = function(st,logger) { // {{{
    logger.log({'desc': desc, 'prev': status, 'curr': st});
    if (status && (status.owner != st.owner)) {
      captured_at = (Date.now() / 1000);
      //logger.log({'message':st.owner + ' captured ' + desc.type.toLowerCase() + ": " + desc.en});
    }
    if (owner_guild != st.owner_guild) {
      /*
      //if (status && st.owner_guild) {
      if (st.owner_guild) {
        //console.log('old('+owner_guild+') new('+st.guild+')');
        logger.log({'guild': st.guild, 'message':desc.type.toLowerCase() + ' ' + desc.en});
        //logger.release(self);
      }
      */
      owner_guild = st.owner_guild;
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
        console.log('fetched guild');
        console.log(guild);
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
function WvWWatcher(stat,pause) { // {{{
  var statusInterval  = null;
  var stats           = document.getElementById(stat);
  var button          = document.getElementById(pause);
  var centerMap       = null;
  var redMap          = null;
  var greenMap        = null;
  var blueMap         = null;
  var xmlhttp         = new XMLHttpRequest();
  var world_id        = null;
  var match_id        = null;
  var match_end_time  = null;
  var guilds          = new WvWGuilds();

  findWorld('Crystal Desert');
  function pauseToggle() { // {{{
    window.clearInterval(statusInterval);
  } // }}}
  this.stop = function() { pauseToggle(); };
  function findWorld(name) {
    var url = "world_names_en.json";

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var worlds = JSON.parse(xmlhttp.responseText);
        for (var i=0; i<worlds.length; i++) {
          if (worlds[i].name == name) {
            world_id = worlds[i].id;
          }
        }
        checkStatus();
        statusInterval = window.setInterval(checkStatus, 30000);
        //findMatch(world_id);
      }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }
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

var watcher = new WvWWatcher("stats","pause");

