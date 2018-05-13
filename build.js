/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

$(function () {
    window.app = new Vue({
        el: '#app',
        data: function () {
            return {
                showFileUploader: false,
                inputFiles: [],
                outputFiles: []
            };
        },
        methods: {
            dragOver: function (e) {
                e.preventDefault();
                if (!e.dataTransfer.types.some(function (t) { return ['Files', 'file'].indexOf(t) >= 0; })) {
                    return;
                }
                if (this.showFileUploader) {
                    return;
                }
                this.showFileUploader = true;
            },
            dragLeave: function (e) {
                e.preventDefault();
                if (!this.showFileUploader) {
                    return;
                }
                this.showFileUploader = false;
            },
            dragEnd: function (e) {
                e.preventDefault();
                this.inputFiles = e.dataTransfer.files;
                this.bulkParse();
                this.showFileUploader = false;
            },
            bulkParse: function () {
                var _this = this;
                Array.prototype.map.call(this.inputFiles, function (file) {
                    _this.parseXML(file);
                });
            },
            parseXML: function (file) {
                try {
                    if (!this.isXML(file)) {
                        var errObj = new TypeError("xmlではありません");
                        errObj.code = 'notXML';
                        throw errObj;
                    }
                    return this.toOutputXML(file);
                }
                catch (err) {
                    console.log(err.stack);
                    switch (err.code) {
                        case 'notXML':
                            this.outputFiles.push({ name: file.name, error: err.message });
                        default:
                            this.outputFiles.push({ name: file.name, error: err.name });
                    }
                }
            },
            isXML: function (file) {
                return file.type === 'text/xml';
            },
            toOutputXML: function (file) {
                var _this = this;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var result = e.target.result;
                    var xml = $($.parseXML(result));
                    var contracts = xml.find('JPTRM > JPM00010 > JPMR00010');
                    contracts.each(function (idx, contract) {
                        var rows = $(contract).find('JPM00013 JPMR00013');
                        rows.each(function (idx, row) {
                            if (idx === 0 || idx === rows.length - 1) {
                                $(row).find('JPM00014').remove();
                            }
                            else {
                                $(row).remove();
                            }
                        });
                    });
                    var xmlToText = (new XMLSerializer()).serializeToString(xml[0]);
                    var blob = new Blob([xmlToText], { type: 'text/xml' });
                    var f = new File([blob], file.name);
                    _this.outputFiles.push(f);
                };
                reader.readAsText(file);
            },
            downloadBlob: function (file) {
                return URL.createObjectURL(file);
            }
        }
    });
});


/***/ })
/******/ ]);
//# sourceMappingURL=build.js.map