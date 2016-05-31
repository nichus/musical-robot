function Castle(myc,count,desc) {
  var size          = 27;
  var canvas        = myc;
  var status        = desc;

  var captured_at   = 0;
  this.id           = function() { return status.id }
  var objective	    = new Objective(desc);
  console.log(objective);

  function draw(stroke,fill) {
    var ctx         = canvas.context;
    var ri          = objective.ri;
    ctx.strokeStyle = stroke;
    ctx.fillStyle   = fill;

    ctx.beginPath();
    ctx.arc(canvas.cx,canvas.cy,size,0,Math.PI*2,false);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = canvas.colors.yellow();
    ctx.fillStyle   = canvas.colors.yellow();

    switch (true) {
      case ri >  180:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-19,0,Math.PI*2,false);
        ctx.stroke();
      case ri >= 120:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-16,0,Math.PI*2,false);
        ctx.stroke();
      case ri >= 60:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-13,0,Math.PI*2,false);
        ctx.stroke();
      case ri >= 30:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-9,0,Math.PI*2,false);
        ctx.stroke();
      case ri >= 10:
        ctx.beginPath();
        ctx.arc(canvas.cx,canvas.cy,size-5,0,Math.PI*2,false);
        ctx.stroke();
      case ri > 0:
	ctx.lineWidth=2;
	ctx.beginPath();
	ctx.arc(canvas.cx,canvas.cy,size-1,0,Math.PI*2,false);
	ctx.stroke();
	ctx.lineWidth=1;
    }
  }
  function righteous_indignation() {
    var now       = Date.now()/1000;
    var duration  = 300;

    if ((captured_at+duration) > now) {
      return captured_at+duration - now;
    }
    return 0;
  }
  this.report = function() { console.log(status.id+": "+status.type+"/"+status.name); }
  this.update = function(st,logger) {
    logger.log({'desc': st, 'prev': status, 'curr': st});
    //this.captured_at = st.last_flipped / 1000;
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
  }
}

