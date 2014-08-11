var ws = null, code_html, code_css, code_js;
var width = 0, height = 0, preview = false, mode = "editor";

window.onload = function() {
  canvas.init();
  resizeEditor();

  $('#code_html').show();
  $('#nav-canvas').hide();
  $('#canvasframe').hide();

  $(window).resize(resizeEditor);

  $('#connect').click(function() { connect(); });

  $('#canvas-clear').click(function() {
    canvas.clear();
    send({"canvas": ["clear", ""]});
  });

  $('#canvas-color').change(function() {
    var color = $(this).val();
    canvas.setColor(color);
    send({"canvas": ["setColor", color]});
  });

  $('#canvas-lineWidth').change(function() {
    var width = $(this).val();
    canvas.lineWidth(width);
    send({"canvas": ["lineWidth", width]});
  });

  $('#canvasframe').mousedown(function(evt) {
    var offset = $(this).offset();
    var pos = {
      x: evt.clientX - offset.left,
      y: evt.clientY - offset.top
    }
    canvas.moveTo(pos);
    send({"canvas": ["moveTo", pos]});
    canvas.penDown = true
  });

  $('#canvasframe').mousemove(function(evt) {
    if (canvas.penDown) {
      var offset = $(this).offset();
      var pos = {
        x: evt.clientX - offset.left,
        y: evt.clientY - offset.top
      }
      canvas.paint(pos);
      send({"canvas": ["paint", pos]});
    }
  });

  $('#canvasframe').mouseup(function(evt) {
    canvas.penDown = false;
  });

  $('#nav-editor li').click(function() {
    // attribute name is the key ..
    var str = $(this).attr('name');

    if (str == "refresh") {
      var data = "<html><head>";
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
    var mode = $(this).attr('name');
    if (mode == "editor") {
      $('#canvasframe').hide();
      $('#nav-canvas').hide();
      $('#editor').show();
      $('#nav-editor').show();
      $('#mode').text('Editor');
    } else if (mode == "canvas") {
      $('#editor').hide();
      $('#preview').hide();
      preview = false;
      $('#nav-editor').hide();
      $('#canvasframe').show();
      $('#nav-canvas').show();
      $('#mode').text('Canvas');
    }
    send({mode: mode});
  });

  // HTML code
  code_html = ace.edit("code_html");
  code_html.setTheme("ace/theme/twilight");
  code_html.getSession().setMode("ace/mode/html");
  // CSS code
  code_css = ace.edit("code_css");
  code_css.setTheme("ace/theme/twilight");
  code_css.getSession().setMode("ace/mode/css");
  // JS code
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
  if (ws && ws.readyState == 1) {
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
    //~ console.log(evt.data);
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
  $('.code').height(height-86);
  $('#preview').height(height-86);
  if (preview) {
    $('.code').width(width/2-8);
    $('#preview').width(width/2-8);
  } else {
    $('.code').width(width-4);
  }
}
