var ws = null, code_html, code_css, code_js;
var width = 0, height = 0, preview = false, mode = "editor";
var mouse = 0;

var canvas = {
  width: 2000,
  height: 2000,
  ctx: null,

  init: function() {
    this.ctx = document.getElementById('canvasframe').getContext("2d");
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = "round";
    this.setColor('black');
  },
  clear: function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    send({"canvas": ["clear", ""]});
  },
  beginPath: function() {
    this.ctx.beginPath();
    send({"canvas": ["beginPath", ""]});
  },
  lineTo: function(pos) {
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    send({"canvas": ["lineTo", pos]});
  },
  moveTo: function(pos) {
    this.ctx.moveTo(pos.x, pos.y);
    send({"canvas": ["moveTo", pos]});
  },
  setColor: function(color) {
    this.ctx.strokeStyle = color;
    send({"canvas": ["setColor", color]});
  },
  lineWidth: function(width) {
    this.ctx.lineWidth = width;
    send({"canvas": ["lineWidth", width]});
  }
}


window.onload = function() {
  canvas.init();
  resizeEditor();

  $('#code_html').show();
  $('#nav-canvas').hide();
  $('#canvasframe').hide();

  $(window).resize(resizeEditor);

  $('#connect').click(function() { connect(); });
  $('#canvas-clear').click(function() { canvas.clear(); });
  $('#canvas-color').change(function() { canvas.setColor($(this).val()); });
  $('#canvas-lineWidth').change(function() { canvas.lineWidth($(this).val()); });

  $('#canvasframe').mousedown(function(evt) {
    var offset = $(this).offset();
    var x = evt.clientX - offset.left;
    var y = evt.clientY - offset.top;
    mouse = {x: x, y: y}
    canvas.beginPath();
    canvas.moveTo(mouse);
  });

  $('#canvasframe').mousemove(function(evt) {
    if (mouse) {
      var offset = $(this).offset();
      var x = evt.clientX - offset.left;
      var y = evt.clientY - offset.top;
      mouse = {x: x, y: y}
      canvas.lineTo(mouse);
    }
  });

  $('#canvasframe').mouseup(function(evt) {
    mouse = 0;
  });

  $('#nav-editor li').click(function() {
    // attribute name is the key ..
    str = $(this).attr('name');

    if (str == "refresh") {
      data = "<html><head>";
      data += "<style>" + code_css.getValue() + "</style>";
      data += "</head><body>";
      data += code_html.getValue();
      data += "<script>" + code_js.getValue() + "<\/script>";
      data += "</body></html>";

      // send to server if connected
      if (ws) {
        ws.send(JSON.stringify({"html": data}));
      }
      // update <iframe> with new HTML
      updateFrame(data);

    } else if (str == "connect") {
      //
      $('#connect-box').slideToggle();

    } else if (str == "preview") {
      //
        togglePreview();
        resizeEditor();

    } else {
      $('.code').hide();
      $('#code_'+str).toggle();
      $('.active').removeClass('active');
      $('#nav-editor li[name='+str+']').addClass('active');
    }
  });

  $('.select-mode li').click(function() {
    // attribute name is the key ..
    mode = $(this).attr('name');
    if (mode == "editor") {
      $('#canvasframe').hide();
      $('#nav-canvas').hide();
      $('#editor').show();
      $('#nav-editor').show();
      $('#mode').text('Editor');
    } else if (mode == "canvas") {
      $('#editor').hide();
      $('#nav-editor').hide();
      $('#canvasframe').show();
      $('#nav-canvas').show();
      $('#mode').text('Canvas');
    }
    send({mode: mode});

  });

  code_html = ace.edit("code_html");
  code_html.setTheme("ace/theme/twilight");
  code_html.getSession().setMode("ace/mode/html");

  code_css = ace.edit("code_css");
  code_css.setTheme("ace/theme/twilight");
  code_css.getSession().setMode("ace/mode/css");

  code_js = ace.edit("code_js");
  code_js.setTheme("ace/theme/twilight");
  code_js.getSession().setMode("ace/mode/javascript");
}

function updateFrame(data) {
  var previewFrame = document.getElementById('mainframe');
  var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
  preview.open();
  preview.write(data);
  preview.close();
}

function send(data) {
  if (ws) {
    ws.send(JSON.stringify(data));
  }
}

function togglePreview() {
  if (preview) {
    $('#preview').hide();
  } else {
    $('#preview').show();
  }
  preview = !preview;
}

function connect() {
  host = $("#host").val();
  ws = new WebSocket("ws://" + host + ":8888/remote");

  ws.onmessage = function(evt) {
    console.log(evt.data);
  };

  ws.onclose = function(evt) {
    console.log("WebSocket close ..");
    $('#connect-box').slideDown();
    $('#connect-box').addClass('connect-error');
    $('#status').text("can't establish a connection to the server");
  };

  ws.onopen = function(evt) {
    console.log("WebSocket open ..")
    $('#status').text("");
    $('#connect-box').removeClass('connect-error');
    $('#connect-box').slideUp();
  };
}

function resizeEditor() {
  width = window.innerWidth;
  height = window.innerHeight;
  $('.code').height(height-96);
  $('#preview').height(height-96);
  if (preview) {
    $('.code').width(width/2-8);
    $('#preview').width(width/2-8);
  } else {
    $('.code').width(width-4);
    //~ $('#preview').width(width/2-8);
  }
}
