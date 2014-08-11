#!/usr/bin/python3
# -*- coding: utf-8 -*-

# David Art [aka] ADcomp <david.madbox@gmail.com>

import os
import sys

from PyQt5.QtWidgets import (QMainWindow, QApplication, QInputDialog, QLineEdit, QMessageBox)
from PyQt5.QtCore import (QUrl, QObject, pyqtSlot, pyqtProperty)
from PyQt5.QtWebKitWidgets import (QWebView, QWebInspector)

__appname__ = "picota"
__author__ = "David Art (ADcomp)"
__license__ = "GNU GPL 2 or later"

REALPATH = os.path.dirname(os.path.realpath(__file__))

class JsObj(QObject):
    """OBject class to communicate with javascript."""

    def __init__(self, parent=None):
        QObject.__init__(self, parent)
        self.mainapp = parent
        self._output = ""
        self._editor = ""

    @pyqtSlot(str, result=str)
    def echo(self, text="what?"):
        return str(text)

    @pyqtSlot(str, result=str)
    def autoComplete(self, text):
        return self.mainapp.console.autoComplete(text)

    @pyqtSlot(str, result=str)
    def history(self, text):
        return self.mainapp.console._get_history(text)

    @pyqtSlot(str, result=str)
    def execute(self, text):
        return self.mainapp.console._executeLine(text)

    @pyqtSlot(str, result=str)
    def runcode(self, text):
        return self.mainapp.console._runcode(text)

    def _getOutput(self):
        return self._output

    output = pyqtProperty(str, fget=_getOutput)

class WebView(QWebView):

    def __init__(self, parent, realpath):
        super(WebView, self).__init__(parent)
        self.mainapp = parent

        # create an obj for communicate with js
        self.jsobj = JsObj(parent)
        self.page().mainFrame().addToJavaScriptWindowObject("picota", self.jsobj)

        self._home = "file:///%s/www/remote.html" % realpath.replace("\\", "/")
        self.gohome()

        # Inspector (for debug ..)
        settings = self.page().settings()
        settings.setAttribute(settings.DeveloperExtrasEnabled, True)
        self.inspector = QWebInspector()
        self.inspector.setPage(self.page())

    def gohome(self):
        self.load(QUrl(self._home))

    def goto(self, url):
        self.load(QUrl(url))

    def eval(self, text):
        # code = json.dumps(text)
        code = text
        return self.page().mainFrame().evaluateJavaScript(code)

class MainWindow(QMainWindow):
    """ main window (QMainWindow) """

    def __init__(self):
        super(MainWindow, self).__init__()
        self.setWindowTitle("picota")
        self.webview = WebView(self, REALPATH)
        self.setCentralWidget(self.webview)

if __name__ == '__main__':

    app = QApplication(sys.argv)
    window = MainWindow()
    window.resize(800, 600)
    window.show()
    # window.webview.inspector.show()
    sys.exit(app.exec_())
