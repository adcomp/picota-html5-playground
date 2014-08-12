var ws = null,
    code_html,
    code_css,
    code_js,
    preview = false,
    mode = "editor",
    code = "html",
    editor_code = {};


window.onload = function() {
  canvas.init();
  resizeEditor();
  $('#code_html').show();

  // Events
  $(window).resize(resizeEditor);

  $(window).keydown(function(evt) {
    if (evt.ctrlKey) {
      if (evt.keyCode == 13) {
        // Ctrl + Enter : refresh frame
        refreshFrame();
      } else if (evt.keyCode == 49) {
        // Ctrl +  1 : show HTML code
        showCode('html');
      } else if (evt.keyCode == 50) {
        // Ctrl +  2 : show CSS code
        showCode('css');
      } else if (evt.keyCode == 51) {
        // Ctrl + 3 : show JS code
        showCode('js');
      } else if (evt.keyCode == 52) {
        // Ctrl + 4 : toggle preview
        togglePreview();
      } else if (evt.keyCode == 53) {
        // Ctrl + 5 : show Canvas
        selectMode('canvas');
      } else {
        console.log(evt.keyCode)
      }
    }
  });

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

  $('#canvas').mousedown(function(evt) {
    var offset = $(this).offset();
    var pos = {
      x: evt.clientX - offset.left,
      y: evt.clientY - offset.top
    }
    canvas.moveTo(pos);
    canvas.paint(pos);
    send({"canvas": ["moveTo", pos]});
    send({"canvas": ["paint", pos]});
    canvas.penDown = true
  });

  $('#canvas').mousemove(function(evt) {
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

  $('#canvas').mouseup(function(evt) {
    canvas.penDown = false;
  });

  $('nav li').click(function() {
    // attribute name is the key ..
    var name = $(this).attr('name');

    if (name == "refresh") {
      refreshFrame();

    } else if (name == "connect") {
      $('#connect-box').slideToggle();

    } else if (name == "preview") {
        togglePreview();

    } else if (name == "editor" || name == "canvas") {
      selectMode(name);

    } else if (name == 'html' || name == "css" || name == "js") {
      showCode(name);
    }

    if (mode == "editor") {
      editor_code[code].focus();
    }
  });

  // HTML code
  code_html = ace.edit("code_html");
  //~ code_html.setTheme("ace/theme/textmate");
  code_html.getSession().setMode("ace/mode/html");

  // CSS code
  code_css = ace.edit("code_css");
  //~ code_css.setTheme("ace/theme/twilight");
  code_css.getSession().setMode("ace/mode/css");

  // JS code
  code_js = ace.edit("code_js");
  //~ code_js.setTheme("ace/theme/twilight");
  code_js.getSession().setMode("ace/mode/javascript");

  editor_code = {"html": code_html, "css": code_css, "js": code_js};

}

function refreshFrame(data) {
  var previewFrame = document.getElementById('mainframe');
  var preview = previewFrame.contentDocument || previewFrame.contentWindow.document;

  var data = "<html><head><style>" + code_css.getValue() + "</style>";
  data += "</head><body>" + code_html.getValue();
  data += "<script>" + code_js.getValue() + "<\/script></body></html>";

  preview.open('text/html', 'replace');
  preview.write(data);
  preview.close();

  // send to server if connected
  if (ws) {
    ws.send(JSON.stringify({"html": data}));
  }
}

function showCode(name) {
  if (mode != 'editor') {
    selectMode('editor');
  }
  $('.code').hide();
  $('#code_' + name).toggle();
  editor_code[name].focus();
  $('.active').removeClass('active');
  $('#nav-editor li[name=' + name + ']').addClass('active');
  code = name;
}

function selectMode(name) {
  if (name == "editor") {
    $('#canvas').hide();
    $('#nav-canvas').hide();
    $('#editor').show();
    $('#nav-editor').show();
  } else if (name == "canvas") {
    $('#editor').hide();
    $('#nav-editor').hide();
    $('#canvas').show();
    $('#nav-canvas').show();
  }
  $('#mode').text(name);
  send({mode: name});
  mode = name;
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
  resizeEditor();
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
    $('#status').removeClass('connected');
    $('#status').addClass('not-connected');
    $('#status').text("can't establish a connection to the server");
  };

  ws.onopen = function(evt) {
    console.log("WebSocket open ..")
    $('#status').text("connected");
    $('#status').removeClass('not-connected');
    $('#status').addClass('connected');
    $('#connect-box').slideUp();
  };
}

function resizeEditor() {
  width = window.innerWidth;
  height = window.innerHeight;
  $('.code').height(height-82);
  $('#preview').height(height-82);
  if (preview) {
    $('.code').width(width/2-8);
    $('#preview').width(width/2-8 -48);
  } else {
    $('.code').width(width-4 -48);
  }
}
